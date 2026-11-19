<?php
if (!isset($_SESSION)) {
   session_start();
}

// Curl Fetch Command
function fetch($url)
{
   $ch = curl_init();
   $headers = array(
      'Accept: application/json',
      'Content-Type: application/json',
   );
   curl_setopt($ch, CURLOPT_URL, $url);
   curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
   curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
   curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
   curl_setopt($ch, CURLOPT_TIMEOUT, 30);
   $data = curl_exec($ch);
   curl_close($ch);
   return $data;
};

// Authentication Checker
function authenticate()
{
   if (!isset($_SESSION['user']) || $_SESSION['user'] == null) {
      $app = \Slim\Slim::getInstance();
      $app->flash('error', 'Login required');
      $app->redirect($app->urlFor('login'));
   }
}


/* Entry or Index Page */
$app->get('/', 'authenticate', function () use ($app) {

   require_once './config/db.php';
   $staff = $_SESSION['user']['staff_no'];
   $rows = [];

   /** CIRCULARS FOR INTRO **/
   // Job Category Circulars
   $row_sql = $db->query("select *,date_format(created_at,'%M %d, %Y') as created_at from circular where find_in_set(" . $_SESSION['user']['job_id'] . ",cat_job_id) > 0 and `status` > 0");
   if ($row_sql->num_rows > 0) {
      while ($row = $row_sql->fetch_array()) {
         $row['attachment'] = $_SESSION['settings']['assethost'] . substr($row['attachment'], 7);
         $row['copied'] = 'ALL ' . $_SESSION['user']['jobtitle'];
         $rows['c' . $row['id']] = $row;
      }
   }
   // Unit Members Members Circulars
   $row_sql = $db->query("select *,date_format(created_at,'%M %d, %Y') as created_at from circular  where find_in_set(" . $_SESSION['user']['unit_id'] . ",cat_unit_id) > 0 and cat_unit_status = 'ALL' and `status` > 0");
   if ($row_sql->num_rows > 0) {
      while ($row = $row_sql->fetch_array()) {
         $row['attachment'] = $_SESSION['settings']['assethost'] . substr($row['attachment'], 7);
         $row['copied'] = 'MEMBERS, ' . $_SESSION['user']['long_name'];
         $rows['c' . $row['id']] = $row;
      }
   }
   // Unit Heads Circulars
   $row_sql = $db->query("select c.*,date_format(c.created_at,'%M %d, %Y') as created_at from circular c left join unit u on find_in_set(u.id,cat_unit_id) > 0 where c.cat_unit_status = 'HOD' and `status` > 0 and (u.unit_head = '" . $_SESSION['user']['staff_no'] . "' or u.unit_subhead  = '" . $_SESSION['user']['staff_no'] . "')");
   if ($row_sql->num_rows > 0) {
      while ($row = $row_sql->fetch_array()) {
         $row['attachment'] = $_SESSION['settings']['assethost'] . substr($row['attachment'], 7);
         $row['copied'] = 'HEAD, ' . $_SESSION['user']['long_name'];
         $rows['c' . $row['id']] = $row;
      }
   }
   // Staff Category Circulars
   $row_sql = $db->query("select *,date_format(created_at,'%M %d, %Y') as created_at from circular where find_in_set('" . $_SESSION['user']['staff_group'] . "',cat_staff_group) > 0 and `status` > 0");
   if ($row_sql->num_rows > 0) {
      while ($row = $row_sql->fetch_array()) {
         $row['attachment'] = $_SESSION['settings']['assethost'] . substr($row['attachment'], 7);
         $row['copied'] = $_SESSION['user']['staff_group'] == 'SM' ? 'ALL SENIOR MEMBERS' : ($_SESSION['user']['staff_group'] == 'SS' ? 'ALL SENIOR STAFF' : 'ALL JUNIOR STAFF');
         $rows['c' . $row['id']] = $row;
      }
   }
   // Staff Included Circulars
   $row_sql = $db->query("select *,date_format(created_at,'%M %d, %Y') as created_at from circular where find_in_set(" . $_SESSION['user']['staff_no'] . ",cat_staff_no) > 0 and `status` > 0");
   if ($row_sql->num_rows > 0) {
      while ($row = $row_sql->fetch_array()) {
         $row['attachment'] = $_SESSION['settings']['assethost'] . substr($row['attachment'], 7);
         $row['copied'] = 'INCLUDED MEMBER';
         $rows['c' . $row['id']] = $row;
      }
   }


   $rows = array_values($rows);
   $rows = array_map("unserialize", array_unique(array_map("serialize", $rows)));
   $id = array_column($rows, 'id');
   array_multisort($id, SORT_DESC, $rows);
   //print_r(json_encode($data));exit;
   $_SESSION['user']['circulars'] = $rows;

   // Render Default Page
   $app->redirect($app->urlFor('profile')); # Staff Profile Page
})->name('index');


/* Dashboard Routes */
$app->get('/profile', 'authenticate', function () use ($app) {
   $app->render('mainlayout.php', [
      'page' => 'pages/overview/profile.php',
      'slug' => 'profile'
   ]);
})->name('profile');

$app->get('/profile_report', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $bio_sql = $db->query("select s.staff_no as nox,s.*,DATE_FORMAT(dob,'%d/%m/%Y') as dobx,ifnull(TIMESTAMPDIFF(YEAR, dob, CURDATE()),0) AS age,b.*,upper(concat(sc.grade,', STEP ',sc.notch)) as grade,upper(j.title) as jobtitle, DATE_FORMAT(s.first_appoint_date,'%d/%m/%Y') as first_appoint,DATE_FORMAT(s.confirm_date,'%d/%m/%Y') as first_confirm,DATE_FORMAT(s.first_appoint_date,'%d/%m/%Y') as first_appoint,DATE_FORMAT(p.appoint_date,'%d/%m/%Y') as appoint_date from staff s left join bank b on b.id = s.bank_id left join promotion p on p.id = s.promo_id left join scale sc on sc.id = p.scale_id left join job j on p.job_id = j.id where s.staff_no = " . $user['staff_no']);
   $rel_sql = $db->query("select *,ifnull(DATE_FORMAT(dob,'%d/%m/%Y'),'NOT SET') as dobx,ifnull(TIMESTAMPDIFF(YEAR, dob, CURDATE()),0) AS age,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name from staff_rel where staff_no = " . $user['staff_no']);
   $cert_sql = $db->query("select * from certificate where staff_no = " . $user['staff_no']);
   $doc_sql = $db->query("select * from doc where `default` = 1 and staff_no = " . $user['staff_no']);
   $trans_sql = $db->query("select t.*,year(transfer_date) as year,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,date_format(transfer_date,'%D %M, %Y') as transdate,s.photo,x.long_name as tounit,f.long_name as fromunit,j.title as jobtitle,t.id,s.staff_no as nox from transfer t left join staff s on s.staff_no = t.staff_no left join unit x on x.id = t.to_unit left join unit f on f.id = t.from_unit left join promotion p on s.promo_id = p.id left join job j on p.job_id = j.id where t.staff_no = " . $user['staff_no'] . " and t.flag_delete = 0 order by transfer_date desc,id desc");
   $trans = [];
   $rel = [];
   $cert = [];
   $doc = [];
   $bio = [];
   if ($bio_sql->num_rows > 0) {
      $bio = $bio_sql->fetch_array();
      //$bio['photo'] = isPhoto($bio['photo']);
      $bio['photo'] = 'https://cdn.ucc.edu.gh/photos/?tag=' . $bio['staff_no'];
      if ($rel_sql->num_rows > 0) {
         while ($row = $rel_sql->fetch_assoc()) {
            $rel[] = $row;
         }
      }
      if ($cert_sql->num_rows > 0) {
         while ($row = $cert_sql->fetch_assoc()) {
            $cert[] = $row;
         }
      }
      if ($doc_sql->num_rows > 0) {
         while ($row = $doc_sql->fetch_assoc()) {
            $doc[] = $row;
         }
      }
      if ($trans_sql->num_rows > 0) {
         while ($row = $trans_sql->fetch_assoc()) {
            $trans[] = $row;
         }
      }
      //var_dump($bio);exit;
      $app->render('reportlayout.php', [
         'page' => 'pages/overview/rep_profile.php',
         'slug' => 'profile',
         'bio' => $bio, 'rel' => $rel, 'cert' => $cert, 'doc' => $doc, 'trans' => $trans
      ]);
   } else {
      session_destroy();
      $app->flash('error', 'Wrong user credentials!');
      $app->redirect('login');
   }
});


// Notification Route
$app->get('/notification', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $sql = $db->query("select *,DATE_FORMAT(datetime,'%d/%m/%Y') as datetime from notification where staff_no = " . $user['staff_no']);
   $data = [];
   if ($sql->num_rows > 0) {
      while ($row = $sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   $app->render('mainlayout.php', [
      'page' => 'pages/overview/notification.php',
      'slug' => 'notification',
      'data' => $data
   ]);
});

/* Dashboard Routes */
$app->get('/ghcard_update', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $edu = $db->query("select ghana_card_no from `staff` where staff_no = " . $user['staff_no'])->fetch_assoc();
   // var_dump($edu['ghana_card_no']);die();
   $app->render('mainlayout.php', [
      'page' => 'pages/overview/ghcard_update.php',
      'slug' => 'ghcard_update',
      'ghana_card_no' => $edu['ghana_card_no']
   ]);
})->name('ghcard_update');

/* Dashboard Routes */
$app->get('/counseling', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $staff_no = $_SESSION['user']['staff_no'];
   $edu = $db->query("SELECT * FROM hrmscode.counselors_staff where staff_id = '$staff_no'");
   // var_dump($edu);die();
   $data1 = [];
   if ($edu->num_rows > 0) {
      while ($row = $edu->fetch_assoc()) {
         $data1[] = $row;
      }
   }
   $app->render('mainlayout.php', [
      'page' => 'pages/overview/counseling.php',
      'slug' => 'counseling',
      'couns_list' => $data1
   ]);
})->name('counseling');


/* EduRoam Routes */
$app->get('/eduroam', 'authenticate', function () use ($app) {
   $app->render('mainlayout.php', [
      'page' => 'pages/overview/eduroam.php',
      'slug' => 'eduroam'
   ]);
})->name('eduroam');


$app->get('/eduroam_user', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $edu = $db->query("select password from `user` where staff_no = " . $user['staff_no'])->fetch_assoc();
   if (count($edu) > 0) {
      $app->render('pages/overview/eduroam_user.php', [
         'slug' => 'eduroam',
         'email' => $user['ucc_mail'], 'password' => $edu['password']
      ]);
   }
});



/*  MAIN LEAV MODULE  */

// Leave Module
$app->get('/leavereq', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $host = $app->host;
   //$cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.*,s.*,t.*,concat(r.lname,', ',r.fname,' ',r.mname,'<br>(',l.relieved_by,')') as relieve,concat(u.lname,', ',u.fname,' ',u.mname,'<br>(',l.head_endorse,')') as uhead,concat(h.lname,', ',h.fname,' ',h.mname,'<br>(',l.hr_endorse,')') as hhead from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id left join staff r on r.staff_no = l.relieved_by left join staff u on u.staff_no = l.head_endorse left join staff h on h.staff_no = l.hr_endorse left join promotion p on p.id = s.promo_id where year(applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']);
   $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = " . $user['staff_no'] . " order by l.id desc");
   $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = " . $user['staff_no']);
   $data = [];
   $flag = [];
   if ($cur_sql->num_rows > 0) {
      while ($row = $cur_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   if ($flag_sql->num_rows > 0) {
      $flag = $flag_sql->fetch_assoc();
   }

   # Get Annual Leave Data from api

   $url = $host . '/getleavedata/' . $user['staff_no'] . '/2';
   $leave = json_decode(fetch($url), true);
   $app->render('mainlayout.php', [
      'page' => 'pages/leave/leavereq.php',
      'slug' => 'leavereq',
      'data' => $data,
      'leave' => $leave,
      'flag' => $flag
   ]);
})->name('leavereq');


// Leave Statistics Page
$app->get('/leavestat', function () use ($app) {
   $app->render('mainlayout.php', [
      'page' => 'pages/leave/leavestat.php',
      'slug' => 'leavestat'
   ]);
});


// Leave Statistics Report
$app->get('/leavestatrep', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $staff = $_SESSION['user']['staff_no'];
   $row_sql = $db->query("select l.id as lid,t.title,year(applied_date) as year,date_format(applied_date,'%a %b %d, %Y') as adate,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.*,s.*,t.*,concat(r.lname,', ',r.fname,' ',r.mname,' (',l.relieved_by,')') as relieve,concat(u.lname,', ',u.fname,' ',ifnull(u.mname,''),' (',l.head_endorse,')') as uhead,concat(h.lname,', ',h.fname,' ',h.mname,' (',l.hr_endorse,')') as hhead from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id left join staff r on r.staff_no = l.relieved_by left join staff u on u.staff_no = l.head_endorse left join staff h on h.staff_no = l.hr_endorse where l.staff_no = " . $staff . " order by year(applied_date) desc,lid desc,t.title,l.status");
   $rows = [];
   if ($row_sql->num_rows > 0) {
      while ($row = $row_sql->fetch_array()) {
         //$row['photo'] = isPhoto($row['photo']);
         $row['photo'] = 'https://cdn.ucc.edu.gh/photos/?tag=' . $row['staff_no'];
         $rows[] = $row;
      }
   }
   if (count($rows) > 0) {
      $app->render('reportlayout.php', [
         'page' => 'pages/leave/rep_leavestat.php',
         'slug' => 'leavestat',
         'title' => 'LEAVE STATISTICS',
         'data' => $rows
      ]);
   } else {
      echo '<div style="width:100%;margin:0px auto 10px 80px;"><img src="public/images/zero.png"</div>';
   }
});



// Leave Form Report
$app->get('/leaveformrep/:sno', 'authenticate', function ($sno) use ($app) {
   require_once './config/db.php';
   $row_sql = $db->query("select l.id as lid,j.title as jobtitle, year(applied_date) as year,date_format(applied_date,'%a %b %d, %Y') as adate,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.*,s.*,t.*,l.emergency_contact,concat(r.lname,', ',r.fname,' ',r.mname,' (',l.relieved_by,')') as relieve,concat(u.lname,', ',u.fname,' ',ifnull(u.mname,''),' (',l.head_endorse,')') as uhead,concat(h.lname,', ',h.fname,' ',h.mname,' (',l.hr_endorse,')') as hhead from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join promotion p on p.id = s.promo_id left join job j on j.id  = p.job_id left join leave_type t on t.id = l.type_id left join staff r on r.staff_no = l.relieved_by left join staff u on u.staff_no = l.head_endorse left join staff h on h.staff_no = l.hr_endorse where l.id =" . $sno);
   $row = null;
   if ($row_sql->num_rows > 0) {
      $row = $row_sql->fetch_assoc();
      //$row['photo'] = isPhoto($row['photo']);
      $row['photo'] = 'https://cdn.ucc.edu.gh/photos/?tag=' . $row['staff_no'];
   }
   $app->render('reportlayout.php', [
      'page' => 'pages/leave/rep_leaveform.php',
      'slug' => 'leaveform',
      'title' => 'LEAVE FORM',
      'data' => $row
   ]);
});


$app->get('/academicadviseform', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $host = $app->host;
   $sno = $app->request->get('sno');
   $action = $app->request->get('action');

   if (!empty($sno)) {
      $row_sql_out_sql = "select t2.* from osisauth.users as t1 left join osis.prog_db as t2 on t1.deptid = t2.deptid where runtype = '01' and progtype = '01' and staff_no = " . $sno;
      $row_sql_out = $db->query($row_sql_out_sql);
      $row_sql = $db->query("select * from academic_advisers as t1 left join osis.prog_db as t2 on t1.progid = t2.progid where approved = 0 and stage_status = 0 and t1.status = 1 and t1.staff_no = " . $sno);
      $row_sdata1 = $db->query("select s.*,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name from staff s 
      left join promotion p on s.promo_id = p.id where s.staff_no = " . $sno);

      // echo $sno;die();
      $row = [];
      $row_sql_ad = [];
      if ($row_sql) {
         // echo $sno;die();

         // $row = $row_sql->fetch_assoc();
         $row_aca_ad = $row_sql->fetch_array();
         // var_dump($row);die();
         //$row['photo'] = isPhoto($row['photo']);
         // $row['photo'] = 'https://cdn.ucc.edu.gh/photos/?tag='.$row['staff_no'];
      }
      while ($row = $row_sql_out->fetch_assoc()) {
         $row_sql_ad[] = $row;
      }
      // $row_sql_ad = $row_sql_out->fetch_array();
      $row_sdata = $row_sdata1->fetch_array();
      // else{
      //    $row = 'pal';
      // echo $row_sql_out_sql; die();
      // }
      // var_dump($row_sql_ad);die();
      $app->render('pages/head/advisers_form.php', [
         'action' => $action,
         'data' => $row,
         'row_sdata' => $row_sdata,
         'row_sql_out' => $row_sql_ad,
         'st_advice' => $row_aca_ad
      ]);
      // $app->render('reportlayout.php',[
      //    'page' => 'pages/leave/rep_leaveform.php',
      //    'slug' => 'leaveform',
      //    'title' => 'LEAVE FORM',
      //    'data' => $row
      // ]);
   } else {
      echo 'Error';
   }
});

$app->get('/academicadvisechat', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $host = $app->host;
   $studid = $app->request->get('studid');
   // var_dump($studid);die();
   $staff = $_SESSION['user']['staff_no'];

   $upro_sql3 = $db->query("SELECT * from academic_advisers 
   where staff_no = '$staff' and approved = 0 and stage_status = 0 and status = 1");

   $upro_mes = $db->query("SELECT * from adviserschatlog 
   where (sender_id = '$staff' or receiver = '$staff') and (sender_id = '$studid' or receiver = '$studid') and status = 1");
   if ($upro_sql3) {
      $data1 = [];
      if ($upro_sql3->num_rows > 0) {
         while ($row1 = $upro_sql3->fetch_assoc()) {
            $data1[] = $row1;
         }
      }
      $data3 = [];
      if ($upro_mes->num_rows > 0) {
         while ($row2 = $upro_mes->fetch_assoc()) {
            $data3[] = $row2;
         }
      }
      // var_dump($data1['level_ass']);die();
      $level_ass = $data1[0]['level_ass'];
      $progid = $data1[0]['progid'];
      if (!empty($data1)) {
         $upro_sql2 = $db->query("SELECT distinct t1.studid, t1.Regno,concat(t1.lname,', ',t1.fname,' ',ifnull(t1.mname,' ')) Name,
               t1.cellphone, t1.inst_email, t1.sex,
               round(sum(if(t2.audit!=1,t3.credits,0)*t4.value)/sum(if(t2.audit!=1,t3.credits,0)),3) CGPA,  doa, t6.long_name Programme
               from osissp.assmain as t2 
               left join osis.students_db as t1 on t1.studid=t2.studid
               left join osissp.asshead as t3 on t2.assheadcode=t3.assheadcode and t2.courseid=t3.courseid and t2.groupnum=t3.groupnum and t2.resit = t3.resit
               left join osispref.trial_grades as t4 on t2.grade=t4.grade
               left join osispref.classes as t5 on t5.scheme_id=t4.scheme
               left join osis.prog_db as t6 on t6.progid=t2.progid
               left join osis.major_db as t7 on t7.majorid=t1.majorid
               left join osis.course_db as t8 on t8.courseid=t2.courseid
               left join osis.degree_category as t9 on t9.degreeid=t6.degreeid
               left join osis.faculty as t10 on t6.facultyid = t10.facultyid
               WHERE t2.session BETWEEN 20161 and 20231 AND t6.runtype=1 and t6.progtype = '01'
               AND t1.level = '$level_ass' and t1.studid = '$studid' and t1.progid = '$progid' and  t1.completed=0 and entrylevel = 100 and graduate=0
               group by t1.studid, t1.regno, t1.lname, t1.fname, t1.mname, t1.sex, doa, t6.long_name
               ORDER BY CGPA DESC");

         if ($upro_sql2) {
            $data2 = [];
            if ($upro_sql2->num_rows > 0) {
               while ($row2 = $upro_sql2->fetch_assoc()) {
                  $data2[] = $row2;
               }
            }
         }
         # code...
      }
      $app->render('pages/head/adviser_chat.php', [
         'data1' => $data1,
         'message' => $data3,
         'data2' => $data2
      ]);
   } else {
      echo 'Error';
   }
});


$app->post('/message_reply', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $host = $app->host;
   $r = $app->request();
   // var_dump($_POST);
   // die();
   $message = $r->post('message');
   $studid = $r->post('studid');
   $status = '1';
   $sender = $_SESSION['user']['staff_no'];
   $sql = "INSERT INTO adviserschatlog(sender_id, status, message, receiver) 
   values ('$sender', '$status', '$message', '$studid')";
   // echo $sql;die();
   $run = $db->query($sql);
   if ($run) {
      $app->flash('success', 'Message sent successfully!');
   } else {
      // echo 'pal3';die();
      $app->flash('error', 'Message not sent!');
   }
   $app->redirect($app->urlFor('stud_list'));
});



// AJAX - Leave Form 
$app->get('/ajaxleaveform', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $host = $app->host;
   $sno = $app->request->get('sno');
   $action = $app->request->get('action');

   if (!empty($sno) && !empty($action)) {
      $st = $db->query("select concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,s.gender,s.staff_group,s.staff_no from staff s left join promotion p on s.promo_id = p.id where s.staff_no = " . $sno)->fetch_assoc();

      if ($action == 'choose') {
         $leave_type_sql = $db->query("select * from leave_type where active = 1");
         if ($leave_type_sql->num_rows > 0) {
            $data = [];
            while ($row = $leave_type_sql->fetch_array()) {
               if ($row['id'] == '3' && $st['gender'] == 'M') {
                  continue;
               }
               $url = $host . '/getleavedata/' . $sno . '/' . $row['id'];
               $leave = json_decode(fetch($url), true);
               if ($leave['canapply'] == false) {
                  continue;
               }
               $data[] = array('title' => $row['title'], 'typeid' => $row['id'], 'sno' => $sno, 'data' => $leave, 'group' => $st['staff_group']);
            }
            $app->render('pages/leave/leaveform.php', [
               'action' => $action,
               'data' => $data,
               'st' => $st
            ]);
            //print_r($data);
         }
      } else if ($action == 'applyform') {
         $data = [];
         $data['ent'] = !empty($app->request->get('ent')) ? $app->request->get('ent') : 0;
         $data['typeid'] = !empty($app->request->get('typeid')) ? $app->request->get('typeid') : 0;
         $data['title'] = !empty($app->request->get('title')) ? $app->request->get('title') : '';
         $data['group'] = !empty($app->request->get('group')) ? $app->request->get('group') : '';
         $data['sno'] = !empty($app->request->get('sno')) ? $app->request->get('sno') : '';
         $app->render('pages/leave/leaveform.php', [
            'action' => $action,
            'data' => $data,
            'st' => $st
         ]);
      }
   } else {
      # Return Instruction Page
   }
});

$app->get('/promo_data', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $host = $app->host;
   echo $sno = $app->request->get('sno');
   echo $pid = $app->request->get('pid');
   // echo 'pal';die();

   if (!empty($sno) && !empty($pid)) {
      $data0 = $db->query("SELECT t1.promo_status as act_promo_status, t1.returned as act_returned, t1.type as act_type,
      t1.activity_date as act_activity_date, t1.comments as act_comments, t1.activity, t1.stage_file,
      t1.stage_activity, t1.updatedpapers, t1.updatedcv, t2.promo_doc1, t2.promo_doc2, t2.apply_form, t2.stage, t2.assessor1,
      t2.assessor2,t2.assessor3, t2.assessor4, t2.assessor5, t2.assessor6, t2.promo_status, t2.stage_status,
      t2.activity_date,t2.type, t2.returned, t2.promo_comments
      FROM promo_activities AS t1 
      LEFT JOIN staff_promotion AS t2 ON t1.promotion_id = t2.promotion_id 
      WHERE t1.promotion_id = $pid and t1.comments not like '%Submitted files for promotion%'");
      $data1 = $db->query("SELECT * FROM promo_activities WHERE promotion_id = $pid AND promo_status= 1 and activity = 0 limit 1");
      $data8 = $db->query("SELECT * FROM promo_activities AS t1 
      LEFT JOIN staff_promotion AS t2 ON t1.promotion_id = t2.promotion_id 
      WHERE t1.promotion_id = $pid");
      $data9 = $db->query("SELECT * FROM promotion_data WHERE promo_id = $pid");
      $data12 = $db->query("SELECT * FROM promo_papers WHERE promo_id = $pid");

      $ps20 = [];
      $ps22 = [];
      $ps0 = [];
      $ps1 = [];
      $ps8 = [];
      if (!empty($data8)) {
         while ($row = $data8->fetch_assoc()) {
            $ps8[] = $row;
         }
      }

      if (!empty($data9)) {
         while ($row = $data9->fetch_assoc()) {
            $ps20[] = $row;
         }
      }
      if (!empty($data1)) {
         while ($row = $data1->fetch_assoc()) {
            $ps1[] = $row;
         }
      }

      if (!empty($data12)) {
         while ($row = $data12->fetch_assoc()) {
            $ps22[] = $row;
         }
      }

      foreach ($ps20 as $promonew_data) {
      }

      foreach ($ps8 as $pf_data) {
      }

      if (!empty($data0)) {
         while ($row = $data0->fetch_assoc()) {
            $ps0[] = $row;
         }
      }
      foreach ($ps0 as $allpromodata) {
      }

      // if($leave_type_sql->num_rows > 0){
      // var_dump($ps0);
      // var_dump($ps8);
      // var_dump($ps20);
      // var_dump($ps22);
      // var_dump($ps1);
      $data = [];
      $app->render('pages/promotion/promo_data.php', [
         'ps0' => $ps0,
         'ps8' => $ps8,
         'ps20' => $ps20,
         'ps22' => $ps22,
         'ps1' => $ps1
      ]);
      //print_r($data);
      // }


   } else {
      # Return Instruction Page
   }
});


// Staff Delete Leave Requests
$app->get('/delleave/:id', 'authenticate', function ($id) use ($app) {
   require_once './config/db.php';
   $st = $db->query("select staff_no,status from leave_dump where id =" . $id)->fetch_assoc();
   $db->query("update staff set flag_leave_lock = 0,flag_leave = 0 where staff_no = " . $st['staff_no']); // Lock Extra Leave Applications
   $db->query("delete from leave_dump where id = " . $id);
   $app->redirect($app->urlFor('leavereq'));
});

// Post Individual Leave Request
$app->post('/postleave', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $host = $app->host;
   $r = $app->request();
   $group = $r->post('group');
   $type = $r->post('typeid');
   $appr = $r->post('approved_days');
   $start = $r->post('start_date');
   $sno = $r->post('sno');
   $ent = $r->post('entitlement');
   $emernote = $r->post('emergency_note');
   $emerphone = $r->post('emergency_contact');
   $status = 'HEAD-PENDING';
   $applied = date('Y-m-d');
   $dt = json_decode(fetch($_SESSION['settings']['apihost'] . '/getleaveinfo?approved_days=' . $appr . '&type=' . $type . '&group=' . $group . '&start_date=' . $start), true);
   //var_dump($dt);
   $start = $dt['start'];
   $end = $dt['end'];
   $resume = $dt['resume'];
   $sql = "insert into leave_dump(staff_no,approved_days,entitlement,type_id,emergency_note,emergency_contact,status,applied_date,start_date,end_date,resume_date) ";
   $sql .= " values (${sno},${appr},${ent},${type},'${emernote}','${emerphone}','${status}','${applied}','${start}','${end}','${resume}')";
   $run = $db->query($sql);
   if ($run) {
      $db->query("update staff set flag_leave_lock = 1 where staff_no = " . $sno); // Lock Extra Leave Applications
      $app->flash('success', 'Leave application successful!');
   } else {
      $app->flash('error', 'Leave application failed!');
   }
   $app->redirect($app->urlFor('leavereq'));
});
$app->post('/staff_self_appraisal_update', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $host = $app->host;
   $r = $app->request();

   $staff_no = $_SESSION['user']['staff_no'];
   $unit_id = $_SESSION['user']['unit_id'];
   $sup_signed = trim($r->post('sup_signed'));
   $app_self_id = trim($r->post('app_self_id'));
   $app_status = '2';

   if (!empty($sup_signed)) {
      $asess_as = $db->query("UPDATE staff_self_appraisal SET `sup_signed` = '${sup_signed}', app_status = '${app_status}'
			WHERE app_self_id = ${app_self_id}");
      if ($asess_as) {

         $data1 = [
            'status' => 'success',
            'message' => 'Appraisal has been updated successfully'
         ];
         echo json_encode($data1);
      } else {
         $data1 = [
            'status' => 'error',
            'message' => 'Error updating data'
         ];
         echo json_encode($data1);
      }
   }
});

$app->get('/leave_relieve', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $s_type = $_SESSION['user']['staff_type'];
   $sno = $_SESSION['user']['staff_no'];
   $host = $app->host;
   $pos_sql = $db->query("select * from hr.staff where flag_leave > 0 or flag_leave_lock > 0");

   $data1 = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data1[] = $row;
      }
   }
   // var_dump($data1[0]['staff_no']);
   foreach ($data1 as $key) {
      $sno = $key['staff_no'];
      $asess_as = $db->query("select *, if(DATEDIFF(end_date, LEFT(NOW(),10)) < 1, 'ENDED','ONLEAVE') as state  from hr.leave_dump where auto_end = 0 and DATEDIFF(end_date, LEFT(NOW(),10)) < 1 and status != 'CANCELLED'  order by id desc limit 1");
      // $asess_as = $db->query("select *, if(DATEDIFF(end_date, LEFT(NOW(),10)) < 1, 'ENDED','ONLEAVE') as state  from hr.leave_dump where staff_no = ${sno} and auto_end = 0 order by id desc limit 1");

      $data_leave = [];
      if ($asess_as->num_rows > 0) {
         while ($row = $asess_as->fetch_assoc()) {
            $data_leave[] = $row;
         }
      }
      // var_dump($data_leave);
      if (!empty($data_leave)) {
         $state = $data_leave[0]['state'];
         $relieved_by = $data_leave[0]['relieved_by'];
         $ldid = $data_leave[0]['id'];

         if (!empty($relieved_by)) {
            $asess_as = $db->query("update hr.staff set flag_leave = 0, flag_leave_lock = 0 where staff_no = ${relieved_by}");
            if ($asess_as) {
               # code...
               echo "Reliever Update Done successfully";
               echo "<br>";
            }
         }

         //   if ($state == 'ENDED') {
         # code...
         // echo "ended";
         // echo "<br>";
         // die();
         //  echo $ldid;
         $asess_as = $db->query("update hr.staff set flag_leave = 0, flag_leave_lock = 0 where staff_no = ${sno}");
         $asess_as1 = $db->query("update hr.leave_dump set auto_end = 1, status = 'ENDED' where id = ${ldid}");
         //   var_dump($asess_as1);die();
         if ($asess_as1) {
            # code...
            echo "Dump Update Done successfully";
            echo "<br>";
         }
         if ($asess_as) {
            # code...
            echo "Update Done successfully";
            echo "<br>";
         }

         //   }
      }
   }
   die();
   $app->render('promolayout.php', [
      'page' => 'pages/tnd/leave_relieve.php',
      'slug' => 'leave_relieve',
      'data1' => $data1
   ]);
})->name('leave_relieve');

$app->post('/assessor_assign', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $host = $app->host;
   $r = $app->request();

   $staff_no = $_SESSION['user']['staff_no'];
   $unit_id = $_SESSION['user']['unit_id'];
   $promotion_id = trim($r->post('pid'));
   $assessor1 = trim($r->post('assessor1'));
   $assessor2 = trim($r->post('assessor2'));
   $assessor3 = trim($r->post('assessor3'));
   $assessor4 = trim($r->post('assessor4'));
   $assessor5 = trim($r->post('assessor5'));
   $assessor6 = trim($r->post('assessor6'));
   $promo_status = '5';
   $activity = '3';
   $stage_activity = 'Assigned Assessor';
   $comments = 'Assigned to Assessor';

   if (!empty($assessor1)) {
      $asess_as = $db->query("UPDATE staff_promotion SET assessor1 = '${assessor1}', assessor2 = '${assessor2}', 
			assessor3 = '${assessor3}', assessor4 = '${assessor4}', assessor5 = '${assessor5}', assessor6 = '${assessor6}', stage_status = 3
			WHERE promotion_id = ${promotion_id}");
      if ($asess_as) {
         $sql1 = "INSERT INTO promo_activities(unit_id,user_id,promotion_id,stage_activity,comments,promo_status,activity)";
         $sql1 .= "VALUES (${unit_id},${staff_no},${promotion_id},'${stage_activity}','${comments}','${promo_status}','${activity}')";
         $getr = $db->query($sql1);

         $data1 = [
            'status' => 'success',
            'message' => 'Assessor has been assigned successfully'
         ];
         echo json_encode($data1);
      } else {
         $data1 = [
            'status' => 'error',
            'message' => 'Error uploading data'
         ];
         echo json_encode($data1);
      }
   }
});

// Head Endorse Leave
$app->post('/approveleave', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $host = $app->host;
   $r = $app->request();
   $group = $r->post('group');
   $type = $r->post('typeid');
   $appr = $r->post('approved_days');
   $start = $r->post('start_date');
   $id = $r->post('id');
   $status = 'HR-PENDING';
   $head_date = date('Y-m-d');
   $head_endorse = $_SESSION['user']['staff_no'];
   $relieved_by = $r->post('relieved_by');
   $dt = json_decode(fetch($_SESSION['settings']['apihost'] . '/getleaveinfo?approved_days=' . $appr . '&type=' . $type . '&group=' . $group . '&start_date=' . $start), true);
   $start = $dt['start'];
   $end = $dt['end'];
   $resume = $dt['resume'];
   $sql = "update leave_dump set approved_days = ${appr}, status = '${status}', head_date = '${head_date}', head_endorse = ${head_endorse}, start_date = '${start}', end_date = '${end}', resume_date = '${resume}' where id = " . $id;
   $run = $db->query($sql);
   if ($run) {
      $db->query("update staff set flag_leave_lock = 1,flag_leave = 2 where staff_no = " . $relieved_by); // Lock Extra Leave Applications for Reliever
      $app->flash('success', 'Leave application successful!');
   } else {
      $app->flash('error', 'Leave application failed!');
   }
   $app->redirect($app->urlFor('unitleave'));
});

$app->post('/endorse_adviser', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $host = $app->host;
   $r = $app->request();
   // var_dump($_POST);
   // die();
   $level_ass = $r->post('level_ass');
   $unit_id = $r->post('unit_id');
   $sno = $r->post('sno');
   $activity = $r->post('activity');
   $approved = $r->post('approved');
   $progid = $r->post('progid');
   $stage_status = $r->post('stage_status');
   $status = $r->post('status');
   $head_endorse = $_SESSION['user']['staff_no'];

   // if ($run) {
   // echo 'pal';die();
   $oneadvice1 = "select * from academic_advisers where staff_no = '$sno' order by id desc limit 1";
   $oneadvice = $db->query($oneadvice1);
   // echo $oneadvice1;
   // die();
   $data_advice = [];
   if ($oneadvice->num_rows > 0) {
      while ($row = $oneadvice->fetch_assoc()) {
         $data_advice[] = $row;
      }
      $adviceid = $data_advice[0]['id'];
      $sql = "UPDATE academic_advisers SET unit_head = '$head_endorse', level_ass = $level_ass, progid = '$progid' where id = $adviceid";
      // echo $sql;die();
      $run = $db->query($sql);
   } else {
      $sql = "INSERT INTO academic_advisers(unit_head, staff_no, unit_id, level_ass, progid, activity, approved,stage_status, status) 
   values ('$head_endorse', '$sno', $unit_id, $level_ass, '$progid', '$activity', $approved, $stage_status, $status)";
      // echo $sql;die();
      $run = $db->query($sql);
      if ($run) {
         // echo 'pal';die();
         $oneadvice1 = "select * from academic_advisers where staff_no = '$sno' order by id desc limit 1";
         $oneadvice = $db->query($oneadvice1);
         // echo $oneadvice1;die();
         $data_advice = [];
         if ($oneadvice->num_rows > 0) {
            while ($row = $oneadvice->fetch_assoc()) {
               $data_advice[] = $row;
            }
         }
      }
   }

   $aa_id = $data_advice[0]['id'];
   // echo $aa_id;die();

   if ($aa_id) {
      // echo 'pal1';die();
      $sql1 = "INSERT INTO academic_advisers_log(aca_id, unit_head, unit_id, activity, approved,stage_status, status) 
      values ($aa_id, '$head_endorse', $unit_id, '$activity', $approved, $stage_status, $status)";
      // echo $sql1;die();
      $run = $db->query($sql1);
      $app->flash('success', 'Nominated successfully!');
   } else {
      // echo 'pal2';die();
      $app->flash('error', 'Nomination failed!');
   }
   // } else {
   //    // echo 'pal3';die();
   //    $app->flash('error', 'Adviser not added!');
   // }
   $app->redirect($app->urlFor('add_advisers'));
});


// Calculate Leave Entitlement
$app->get('/getleavedata/:staff/:type', function ($staff, $type) use ($app) {
   require_once './config/db.php';
   $stud_ = $db->query("SELECT s.id,s.gender,s.staff_no,s.staff_status,p.staff_group,p.job_id,p.unit_id,j.type as staff_type FROM `staff` s left join promotion p on p.id = s.promo_id left join job j on j.id = p.job_id where s.staff_no = " . $staff);
   $stud = $stud_->fetch_array();
   $type = (is_countable($stud) && count($stud) > 0 && $stud['staff_status'] == 'TEMPORAL') ? '1' : $type; // Check If Temporal Staff (Only Casual Leave Applies)
   $apply_ = $db->query("SELECT * FROM `leave_dump` where (staff_no = " . $staff . " or relieved_by = " . $staff . ") and (status = 'GRANTED' or status = 'STAFF-PENDING' or status = 'HEAD-PENDING' or status = 'HR-PENDING') and year(applied_date) ='" . date('Y') . "'");
   $apply = $apply_->fetch_array();  // Can Staff Apply ( Not on Relieve Roles or Still on Previous Leave)
   if (is_countable($stud) && count($stud) > 0) {
      $approved_ = $db->query("SELECT ifnull(sum(approved_days),0) as ent FROM `leave_dump` where staff_no = " . $staff . " and type_id = " . $type . " and (status <> 'HR-REJECTED' and status <> 'HEAD-REJECTED' and status <> 'CANCELLED') and year(applied_date) ='" . date('Y') . "'");
      $approved = $approved_->fetch_assoc();
      $balance_ = $db->query("SELECT weight FROM `leave_balance` where staff_no = " . $staff . " and active = '1'");
      $balance = $balance_->fetch_assoc();
      $con_add_ = $db->query("SELECT sum(weight) as weight FROM `leave_constant` where type='ADD' and category = '" . $stud['staff_group'] . "' and active = '1' and year = '" . date('Y') . "' and (find_in_set('" . $stud['staff_no'] . "',exclusion) <= 0 or exclusion IS NULL)");
      $con_add = $con_add_->fetch_assoc();
      $con_sub_ = $db->query("SELECT sum(weight) as weight FROM `leave_constant` where type='SUB' and category = '" . $stud['staff_group'] . "' and active = '1' and year = '" . date('Y') . "' and (find_in_set('" . $stud['staff_no'] . "',exclusion) <= 0 or exclusion IS NULL)");
      $con_sub = $con_sub_->fetch_assoc();
      $defer_ = $db->query("SELECT * FROM `leave_defer` where staff_no = " . $staff . " and `year` = '" . date('Y') . "'");
      $defer = $defer_->fetch_assoc();
      $weight;
      switch ($stud['staff_group']) {
         case 'SS':
            $k = $weight = $db->query("SELECT * FROM leave_weight where `group` = '" . $stud['staff_group'] . "' and type_id = " . $type)->fetch_assoc();
            break;

         case 'JS':
            $check_ = $db->query("SELECT * from `leave_weight` WHERE `group` = '" . $stud['staff_group'] . "' and type_id = " . $type . " and find_in_set('" . $stud['job_id'] . "',jobs) > 0");
            if ($check_->num_rows > 0) {
               $weight = $check_->fetch_assoc();
            } else {
               $weight = $db->query("select * from `leave_weight` where `group` = '" . $stud['staff_group'] . "' and type_id = " . $type . " and jobs IS NULL")->fetch_assoc();
            }
            break;

         case 'SM':
            $weight = ($stud['staff_type'] == 'NON-ACADEMIC') ? $db->query("SELECT * FROM leave_weight where `group` = '" . $stud['staff_group'] . "' and type_id = " . $type)->fetch_assoc() : [array(weight => null)];
            break;

         default:
            $weight = [array(weight => null)];
            break;
      }
      $ent;
      $sub = (is_countable($con_sub) && count($con_sub) > 0 ? $con_sub['weight'] : 0);
      $add = (is_countable($con_add) && count($con_add) > 0 ? $con_add['weight'] : 0);
      $used = (is_countable($approved) && count($approved) > 0 ? $approved['ent'] : 0);
      $bal = (is_countable($balance) && count($balance) > 0 ? $balance['weight'] : 0);

      if ($stud['gender'] == 'M' && $type == '3') {
         $ent = 0;
      } else {
         $ent = (is_countable($weight) && count($weight) > 0 ? $weight['weight'] : 0);
      }
      $days = ($ent - $used + ($type == '2' ? ($add + $bal - $sub) : 0));
      $due = $days > 0 ? $days : 0;
      # Initialize Form
      if (is_countable($defer) && count($defer) > 0 && ($type == '2' || $type == '3' || $type == '1')) {
         echo json_encode([
            'canapply' => false,
            'deferred' > true,
            'entitlement' => 0,
            'balance' => 0,
            'deduction' => 0,
            'used' => 0,
            'due' => 0
         ]);
      } else {
         echo json_encode([
            'canapply' => (is_countable($apply) && count($apply) > 0 ? false : true),
            'deferred' => false,
            'entitlement' => $ent,
            'balance' => $bal,
            'deduction' => ($type == '2' ? abs($add - $sub) : 0),
            'used' => $used,
            'due' => $due
         ]);
      }
   } else {
      echo json_encode([
         'canapply' => false,
         'deferred' > false,
         'entitlement' => 0,
         'balance' => 0,
         'deduction' => 0,
         'used' => 0,
         'due' => 0
      ]);
   }
});





/*  MAIN PROMOTIONS MODULE  */

// Promotions Module
$app->get('/promoreq', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $host = $app->host;
   //$cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.*,s.*,t.*,concat(r.lname,', ',r.fname,' ',r.mname,'<br>(',l.relieved_by,')') as relieve,concat(u.lname,', ',u.fname,' ',u.mname,'<br>(',l.head_endorse,')') as uhead,concat(h.lname,', ',h.fname,' ',h.mname,'<br>(',l.hr_endorse,')') as hhead from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id left join staff r on r.staff_no = l.relieved_by left join staff u on u.staff_no = l.head_endorse left join staff h on h.staff_no = l.hr_endorse left join promotion p on p.id = s.promo_id where year(applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']);
   $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = " . $user['staff_no'] . " order by l.id desc");
   $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = " . $user['staff_no']);
   $data = [];
   $flag = [];
   if ($cur_sql->num_rows > 0) {
      while ($row = $cur_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   if ($flag_sql->num_rows > 0) {
      $flag = $flag_sql->fetch_assoc();
   }

   # Get Annual Leave Data from api

   $url = $host . '/getleavedata/' . $user['staff_no'] . '/2';
   $leave = json_decode(fetch($url), true);
   $app->render('mainlayout.php', [
      'page' => 'pages/promotion/promoreq.php',
      'slug' => 'leavereq',
      'data' => $data,
      'leave' => $leave,
      'flag' => $flag
   ]);
})->name('promoreq');
$app->get('/promotion_list', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $host = $app->host;
   //$cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.*,s.*,t.*,concat(r.lname,', ',r.fname,' ',r.mname,'<br>(',l.relieved_by,')') as relieve,concat(u.lname,', ',u.fname,' ',u.mname,'<br>(',l.head_endorse,')') as uhead,concat(h.lname,', ',h.fname,' ',h.mname,'<br>(',l.hr_endorse,')') as hhead from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id left join staff r on r.staff_no = l.relieved_by left join staff u on u.staff_no = l.head_endorse left join staff h on h.staff_no = l.hr_endorse left join promotion p on p.id = s.promo_id where year(applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']);
   $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = " . $user['staff_no'] . " order by l.id desc");
   $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = " . $user['staff_no']);
   $data = [];
   $flag = [];
   if ($cur_sql->num_rows > 0) {
      while ($row = $cur_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   if ($flag_sql->num_rows > 0) {
      $flag = $flag_sql->fetch_assoc();
   }

   # Get Annual Leave Data from api

   $url = $host . '/getleavedata/' . $user['staff_no'] . '/2';
   $leave = json_decode(fetch($url), true);
   $app->render('mainlayout.php', [
      'page' => 'pages/promotion/staff_promo.php',
      'slug' => 'leavereq',
      'data' => $data,
      'leave' => $leave,
      'flag' => $flag
   ]);
})->name('promotion_list');


$app->get('/con_renewal', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $s_type = $_SESSION['user']['staff_type'];
   // var_dump($user);
   // die();
   $host = $app->host;
   $pos_sql = $db->query("SELECT * FROM hr.job WHERE type = '$s_type' order by title asc");

   // $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']." order by l.id desc");
   // $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = ".$user['staff_no']);
   $data = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   $app->render('promolayout.php', [
      'page' => 'pages/promotion/contract_renewal.php',
      'slug' => 'con_renewal',
      'data' => $data
   ]);
})->name('con_renewal');


$app->get('/promo_apply', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $s_type = $_SESSION['user']['staff_type'];
   $host = $app->host;
   $pos_sql = $db->query("SELECT * FROM hr.job WHERE type = '$s_type' order by title asc");

   // $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']." order by l.id desc");
   // $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = ".$user['staff_no']);
   $data = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   $app->render('promolayout.php', [
      'page' => 'pages/promotion/promo_apply.php',
      'slug' => 'promo_apply',
      'data' => $data
   ]);
})->name('promo_apply');

$app->get('/promo_apply_sm', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $s_type = $_SESSION['user']['staff_type'];
   $staff_no = $_SESSION['user']['staff_no'];
   $host = $app->host;
   $pos_sql = $db->query("SELECT * FROM hr.job WHERE type = '$s_type' order by title asc");

   $pos_sql_promo_papers = $db->query("SELECT *, t1.status FROM promo_papers as t1 left join staff_promotion as t2 on t1.promo_id = t2.promotion_id where t1.promo_id = t2.promotion_id and t1.staff_no = '$staff_no'");
   $pos_sql_promo = $db->query("SELECT *, t1.status FROM promotion_data as t1 left join staff_promotion as t2 on t1.promo_id = t2.promotion_id where t1.promo_id = t2.promotion_id and t1.staff_no = '$staff_no'");

   if ($s_type == 'NON-ACADEMIC') {
      $staffquery = $db->query("SELECT t1.*,t2.long_name as deptname, t3.long_name as collegename, t4.appoint_date as pos_appoint,t4.confirm_date as pos_confirm, t5.title as currentposition, t7.title as position_applied FROM hr.staff as t1 
      left join hr.unit as t2 on t1.unit_id = t2.id left join hr.unit as t3 on t2.parent_id = t3.id 
      left join hr.promotion as t4 on t1.promo_id = t4.id left join hr.job as t5 on t4.job_id = t5.id
      left join hr.staff_promotion as t6 on t6.staff_no = t1.staff_no left join hr.job as t7 on t7.id = t6.position_id
      WHERE t1.staff_no = '$staff_no'");
   } else {
      $staffquery = $db->query("SELECT t1.*,t2.long_name as deptname, t3.long_name as collegename, t4.appoint_date as pos_appoint,t4.confirm_date as pos_confirm, t5.title as currentposition, t7.title as position_applied FROM hr.staff as t1 
      left join hr.unit as t2 on t1.unit_id = t2.id left join hr.unit as t3 on t2.college_id = t3.id 
      left join hr.promotion as t4 on t1.promo_id = t4.id left join hr.job as t5 on t4.job_id = t5.id
      left join hr.staff_promotion as t6 on t6.staff_no = t1.staff_no left join hr.job as t7 on t7.id = t6.position_id
      WHERE t1.staff_no = '$staff_no'");
   }


   // $college

   // $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']." order by l.id desc");
   // $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = ".$user['staff_no']);
   $data = [];
   $stdata = [];
   $stdata_promo = [];
   $stdata_promo_papers = [];
   if ($pos_sql_promo_papers->num_rows > 0) {
      while ($row3 = $pos_sql_promo_papers->fetch_assoc()) {
         $stdata_promo_papers[] = $row3;
      }
   }
   if ($pos_sql_promo->num_rows > 0) {
      while ($row2 = $pos_sql_promo->fetch_assoc()) {
         $stdata_promo[] = $row2;
      }
   }
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   if ($staffquery->num_rows > 0) {
      while ($row1 = $staffquery->fetch_assoc()) {
         $stdata[] = $row1;
      }
   }
   // var_dump($stdata);die();
   $app->render('mainlayout.php', [
      'page' => 'pages/promotion/promo_apply_sm.php',
      'slug' => 'promo_apply_sm',
      'data' => $data,
      'stdata_promo' => $stdata_promo,
      'stdata_promo_papers' => $stdata_promo_papers,
      'stdata' => $stdata
   ]);
})->name('promo_apply_sm');

$app->get('/printpage', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $s_type = $_SESSION['user']['staff_type'];
   $staff_no = $_SESSION['user']['staff_no'];
   $host = $app->host;
   $pos_sql = $db->query("SELECT * FROM hr.job WHERE type = '$s_type' order by title asc");

   $pos_sql_promo_papers = $db->query("SELECT *, t1.status FROM promo_papers as t1 left join staff_promotion as t2 on t1.promo_id = t2.promotion_id where t1.promo_id = t2.promotion_id and t1.staff_no = '$staff_no'");
   $pos_sql_promo = $db->query("SELECT *, t1.status FROM promotion_data as t1 left join staff_promotion as t2 on t1.promo_id = t2.promotion_id where t1.promo_id = t2.promotion_id and t1.staff_no = '$staff_no'");

   if ($s_type == 'NON-ACADEMIC') {
      $staffquery = $db->query("SELECT t1.*,t2.long_name as deptname, t3.long_name as collegename, t4.appoint_date as pos_appoint,t4.confirm_date as pos_confirm, t5.title as currentposition, t7.title as position_applied FROM hr.staff as t1 
      left join hr.unit as t2 on t1.unit_id = t2.id left join hr.unit as t3 on t2.parent_id = t3.id 
      left join hr.promotion as t4 on t1.promo_id = t4.id left join hr.job as t5 on t4.job_id = t5.id
      left join hr.staff_promotion as t6 on t6.staff_no = t1.staff_no left join hr.job as t7 on t7.id = t6.position_id
      WHERE t1.staff_no = '$staff_no'");
   } else {
      $staffquery = $db->query("SELECT t1.*,t2.long_name as deptname, t3.long_name as collegename, t4.appoint_date as pos_appoint,t4.confirm_date as pos_confirm, t5.title as currentposition, t7.title as position_applied FROM hr.staff as t1 
      left join hr.unit as t2 on t1.unit_id = t2.id left join hr.unit as t3 on t2.college_id = t3.id 
      left join hr.promotion as t4 on t1.promo_id = t4.id left join hr.job as t5 on t4.job_id = t5.id
      left join hr.staff_promotion as t6 on t6.staff_no = t1.staff_no left join hr.job as t7 on t7.id = t6.position_id
      WHERE t1.staff_no = '$staff_no'");
   }


   // $college

   // $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']." order by l.id desc");
   // $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = ".$user['staff_no']);
   $data = [];
   $stdata = [];
   $stdata_promo = [];
   $stdata_promo_papers = [];
   if ($pos_sql_promo_papers->num_rows > 0) {
      while ($row3 = $pos_sql_promo_papers->fetch_assoc()) {
         $stdata_promo_papers[] = $row3;
      }
   }
   if ($pos_sql_promo->num_rows > 0) {
      while ($row2 = $pos_sql_promo->fetch_assoc()) {
         $stdata_promo[] = $row2;
      }
   }
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   if ($staffquery->num_rows > 0) {
      while ($row1 = $staffquery->fetch_assoc()) {
         $stdata[] = $row1;
      }
   }
   // var_dump($stdata);die();
   $app->render('printlayout.php', [
      'page' => 'pages/promotion/printpage.php',
      'slug' => 'printpage',
      'data' => $data,
      'stdata_promo' => $stdata_promo,
      'stdata_promo_papers' => $stdata_promo_papers,
      'stdata' => $stdata
   ]);
})->name('printpage');

$app->get('/procure_itemhod', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $s_type = $_SESSION['user']['staff_type'];
   $host = $app->host;
   if (!empty($_SESSION['order_no'])) {
      # code...
      $orderno = $_SESSION['order_no'];
      // $pos_sql = $db->query("SELECT * FROM hr.job WHERE type = '$s_type' order by title asc");
      $pos_sql = $db->query("SELECT * FROM procurement.req_type order by type_name asc");
      $item_cat = $db->query("SELECT * FROM procurement.item_cat order by cat_name asc");
      $proc_sql = $db->query("SELECT *, t1.id FROM procurement.request_breakdown as t1
left join procurement.req_type as t2 on t1.product_id = t2.id
left join procurement.request as t3 on t1.request_id = t3.request_id 
left join procurement.item_cat as t4 on t1.product_cat = t4.id
where t1.order_no = ${orderno} order by t1.id");

      $data = [];
      if ($pos_sql->num_rows > 0) {
         while ($row = $pos_sql->fetch_assoc()) {
            $data[] = $row;
         }
      }

      $p_bd = [];
      if ($proc_sql->num_rows > 0) {
         while ($row1 = $proc_sql->fetch_assoc()) {
            $p_bd[] = $row1;
         }
      }
      $catdata = [];
      if ($item_cat->num_rows > 0) {
         while ($row2 = $item_cat->fetch_assoc()) {
            $catdata[] = $row2;
         }
      }
      $app->render('promolayout.php', [
         'page' => 'pages/procurement/procure_itemhod.php',
         'slug' => 'procure_itemhod',
         'data' => $data,
         'catdata' => $catdata,
         'procure_data' => $p_bd
      ]);
   } else {
      $item_cat = $db->query("SELECT * FROM procurement.item_cat order by cat_name asc");
      $pos_sql = $db->query("SELECT * FROM procurement.req_type order by type_name asc");

      $data = [];
      if ($pos_sql->num_rows > 0) {
         while ($row = $pos_sql->fetch_assoc()) {
            $data[] = $row;
         }
      }

      $catdata = [];
      if ($item_cat->num_rows > 0) {
         while ($row2 = $item_cat->fetch_assoc()) {
            $catdata[] = $row2;
         }
      }

      $app->render('promolayout.php', [
         'page' => 'pages/procurement/procure_itemhod.php',
         'slug' => 'procure_itemhod',
         'catdata' => $catdata,
         'data' => $data
      ]);
   }
})->name('procure_itemhod');

$app->get('/tnd_apply', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $s_type = $_SESSION['user']['staff_type'];
   $sno = $_SESSION['user']['staff_no'];
   $host = $app->host;
   $pos_sql = $db->query("select * from study_intention where staff_no = $sno and appstatus = 0");

   $data1 = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data1[] = $row;
      }
   }
   $app->render('promolayout.php', [
      'page' => 'pages/tnd/tnd_apply.php',
      'slug' => 'tnd_apply',
      'data1' => $data1
   ]);
})->name('tnd_apply');

$app->get('/tnd_list', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $staff = $_SESSION['user']['staff_no'];
   $host = $app->host;
   $sqlp = "SELECT *,t1.id FROM hr.study_intention AS t1 
   LEFT JOIN hr.staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
   LEFT JOIN hr.job AS t3 ON t2.`job_id` = t3.`id` WHERE t1.staff_no = $staff AND t1.appstatus > 0";
   $pos_sql = $db->query($sqlp);

   $data = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   $app->render('promolayout.php', [
      'page' => 'pages/tnd/tnd_list.php',
      'slug' => 'tnd_list',
      'datalist' => $data
   ]);
})->name('tnd_list');

$app->get('/appraisal_hod', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $staff = $_SESSION['user']['staff_no'];
   $unit = $_SESSION['user']['unit_id'];
   $host = $app->host;
   $pos_sql = $db->query("SELECT t1.`first_appoint_date`, t1.`staff_no`, t4.`app_status` AS app_self_status,t1.`title`,t1.`fname`, t1.`mname`, t1.`lname`, t1.`dob`, t1.`phone`,t1.`unit_id`, t1.`ucc_mail`, 
   t1.`appoint_date`,t2.`short_name`, t2.`long_name`, t2.`parent_flag`, t2.`type`, t3.`title` AS jobtitle,t3.`type` AS jobtype FROM staff AS t1
   LEFT JOIN staff_self_appraisal AS t4 ON t4.`staff_no` = t1.`staff_no`
   LEFT JOIN unit AS t2 ON t1.`unit_id` = t2.`id`
   LEFT JOIN job AS t3 ON t1.`job_id` = t3.`id`
   WHERE t1.unit_id = $unit AND t1.staff_status = 'PERMANENT' ORDER BY t4.`app_self_id` DESC");

   // $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']." order by l.id desc");
   // $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = ".$user['staff_no']);
   $data = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   $app->render('promolayout.php', [
      'page' => 'pages/appraisal/appraisal_hod.php',
      'slug' => 'appraisal_hod',
      'users' => $data
   ]);
})->name('appraisal_hod');

$app->get('/appraisalform/:sno', 'authenticate', function ($sno) use ($app) {
   require_once './config/db.php';
   $year = date("Y");
   $row_sql = $db->query("SELECT * FROM staff_self_appraisal AS t1
   LEFT JOIN staff AS t2 ON t1.`staff_no` = t2.`staff_no`
   LEFT JOIN job AS t3 ON t2.`job_id` = t3.`id`
   LEFT JOIN unit AS t4 ON t2.`unit_id` = t4.`id`
   WHERE t1.`staff_no` = $sno AND t1.`activity_date` LIKE '%$year%'");

   $sql = $db->query("SELECT DISTINCT t2.cat_name, t6.`long_name`, t1.`app_id` AS staff_app_id, t1.`app_status`, t1.supervisor_name, t1.supervisors_rank, t1.yr_onreview, t1.sup_signed, t1.emp_signed, t1.purpose_curr_review, 
   t1.`curr_year_obj`, t4.`fname`, t4.`mname`, t4.`lname`, t4.`staff_no`, t4.`ucc_mail`, t4.`phone`, t4.`appoint_date`, t5.`title` AS jobtitle,
   t1.`dev_needs`, t1.`overall_summary`, t1.`sup_rating`, t1.`emp_comments`, 
   GROUP_CONCAT(t3.`question`,'|',t1.`reply`,'|',t1.`eg` ORDER BY  t3.`question_id` ASC SEPARATOR ':') AS question
   FROM staff_appraisal AS t1
   LEFT JOIN appraisal_question AS t3 ON t1.`question` = t3.`question_id`
   LEFT JOIN appraisal_cat AS t2 ON t3.`cat_id` = t2.`cat_id`
   LEFT JOIN staff AS t4 ON t1.`staff_no` = t4.`staff_no`
   LEFT JOIN job AS t5 ON t4.`job_id` = t5.`id`
   LEFT JOIN unit AS t6 ON t4.`unit_id` = t6.`id`
   WHERE t1.`staff_no` = $sno AND t1.`activity_date` LIKE '%$year%' GROUP BY t2.`cat_id`, t1.`app_id`, t2.`cat_name`");

   $sql1 = $db->query("SELECT DISTINCT t2.`cat_name`, t2.`cat_id`, GROUP_CONCAT(t1.`question`,'|',t1.`question_id` ORDER BY  t1.`question_id` ASC SEPARATOR ':') AS question
   FROM `appraisal_question` AS t1
   LEFT JOIN `appraisal_cat` AS t2 ON t1.`cat_id` = t2.`cat_id`
   WHERE t1.`which_staff` = 1 OR t1.`which_staff` = 2 OR t1.`which_staff` = 3 GROUP BY t2.`cat_id`");

   $sql2 = $db->query("SELECT t1.`first_appoint_date`, t1.photo, t1.`staff_no`,t1.`title`, t1.`staff_group`,t1.`fname`, t1.`mname`, t1.`lname`, t1.`dob`, t1.`phone`,t1.`unit_id`, t1.`ucc_mail`, 
   t1.`appoint_date`,t2.`short_name`, t2.`long_name`, t2.`parent_flag`, t2.`type`, t3.`title` AS jobtitle,t3.`type` AS jobtype FROM staff AS t1 
   LEFT JOIN unit AS t2 ON t1.`unit_id` = t2.`id`
   LEFT JOIN job AS t3 ON t1.`job_id` = t3.`id`
   WHERE t1.staff_no = $sno");

   $sql3 = $db->query("SELECT t1.`first_appoint_date`, t1.`staff_no`, t4.`app_status` AS app_self_status,t1.`title`,t1.`fname`, t1.`mname`, t1.`lname`, t1.`dob`, t1.`phone`,t1.`unit_id`, t1.`ucc_mail`, 
   t1.`appoint_date`,t2.`short_name`, t2.`long_name`, t2.`parent_flag`, t2.`type`, t3.`title` AS jobtitle,t3.`type` AS jobtype FROM staff AS t1
   LEFT JOIN staff_self_appraisal AS t4 ON t4.`staff_no` = t1.`staff_no`
   LEFT JOIN unit AS t2 ON t1.`unit_id` = t2.`id`
   LEFT JOIN job AS t3 ON t1.`job_id` = t3.`id`
   WHERE t1.unit_id = 5202 AND t1.staff_status = 'PERMANENT' ORDER BY t4.`app_self_id` DESC");

   $sql4 = $db->query("SELECT * FROM staff AS t1 LEFT JOIN job AS t2 ON t1.`job_id` = t2.`id` WHERE t1.`staff_no` = $sno");
   $appstaff = [];
   $appraisal_b_data = [];
   $appraisal_b = [];
   $users = [];
   $userhead = [];
   $getstdata = [];
   if ($row_sql->num_rows > 0) {
      while ($row = $row_sql->fetch_assoc()) {
         $appstaff[] = $row;
      }
   }
   if ($sql->num_rows > 0) {
      while ($row = $sql->fetch_assoc()) {
         $appraisal_b_data[] = $row;
      }
   }
   if ($sql1->num_rows > 0) {
      while ($row = $sql1->fetch_assoc()) {
         $appraisal_b[] = $row;
      }
   }
   if ($sql2->num_rows > 0) {
      while ($row = $sql2->fetch_assoc()) {
         $users[] = $row;
      }
   }
   if ($sql3->num_rows > 0) {
      while ($row = $sql3->fetch_assoc()) {
         $userhead[] = $row;
      }
   }
   if ($sql4->num_rows > 0) {
      while ($row = $sql4->fetch_assoc()) {
         $getstdata[] = $row;
      }
   }
   $app->render('appnav.php', [
      'page' => 'pages/appraisal/appraisalform.php',
      'slug' => 'appraisalform',
      'appstaff' => $appstaff,
      'appraisal_b_data' => $appraisal_b_data,
      'appraisal_b' => $appraisal_b,
      'users' => $users,
      'userhead' => $userhead,
      'getstdata' => $getstdata
   ]);
})->name('appraisalform');

$app->get('/promo_list', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $staff = $_SESSION['user']['staff_no'];
   $host = $app->host;
   $sqlp = "SELECT * FROM hr.staff_promotion AS t1 
   LEFT JOIN hr.staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
   LEFT JOIN hr.job AS t3 ON t1.`position_id` = t3.`id` WHERE t1.staff_no = $staff AND t1.type = 0";
   $pos_sql = $db->query($sqlp);
   // var_dump($pos_sql);
   // die();
   // $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']." order by l.id desc");
   // $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = ".$user['staff_no']);
   $data = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   $app->render('promolayout.php', [
      'page' => 'pages/promotion/promo_list.php',
      'slug' => 'promo_list',
      'data' => $data
   ]);
})->name('promo_list');

$app->get('/promo_list_new', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $staff = $_SESSION['user']['staff_no'];
   $host = $app->host;
   $sqlp = "SELECT * FROM hr.staff_promotion AS t1 
   LEFT JOIN hr.staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
   LEFT JOIN hr.job AS t3 ON t1.`position_id` = t3.`id` WHERE t1.staff_no = $staff and t1.promo_status > 0 AND t1.type = 0";
   $pos_sql = $db->query($sqlp);
   // var_dump($pos_sql);
   // die();
   // $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']." order by l.id desc");
   // $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = ".$user['staff_no']);
   $data = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   $app->render('mainlayout.php', [
      'page' => 'pages/promotion/promo_list_new.php',
      'slug' => 'promo_list_new',
      'data' => $data
   ]);
})->name('promo_list_new');

$app->get('/procurement_listhod', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $staff = $_SESSION['user']['staff_no'];

   $type = (isset($_SESSION['user']['type']) ? $_SESSION['user']['type'] : '');

   // die();
   $uhead = $db->query("select t1.* from hr.unit as t1
left join staff as t2 on t2.staff_no = t1.unit_head or t2.staff_no = t1.unit_subhead
left join job as t3 on t2.job_id = t3.id
where t2.staff_no = " . $staff);
   $unithd = $uhead->fetch_array();

   $host = $app->host;
   if ($type == 'ACADEMIC') {
      if (!empty($unithd)) {
         $unit = $unithd['id'];
      } else {
         $unit = $_SESSION['user']['unit_id'];
      }
      $pos_sql = $db->query("SELECT * FROM procurement.request where unit_id = $unit and status > 0 order by request_id desc");
   } else {
      // $unit = $_SESSION['user']['unit_id'];
      if (!empty($unithd)) {
         $unit = $unithd['id'];
      } else {
         $unit = $_SESSION['user']['unit_id'];
      }
      $pos_sql = $db->query("SELECT * FROM procurement.request where unit_id = $unit and status > 0 order by request_id desc");
   }

   $data = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   $app->render('promolayout.php', [
      'page' => 'pages/procurement/procurement_listhod.php',
      'slug' => 'procurement_listhod',
      'positions' => $data
   ]);
})->name('procurement_listhod');

$app->get('/procurement_listdd', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $staff = $_SESSION['user']['staff_no'];

   $type = (isset($_SESSION['user']['type']) ? $_SESSION['user']['type'] : '');

   // die();
   $uhead = $db->query("select t1.* from hr.unit as t1
left join staff as t2 on t2.staff_no = t1.unit_head or t2.staff_no = t1.unit_subhead
left join job as t3 on t2.job_id = t3.id
where t2.staff_no = " . $staff);
   $unithd = $uhead->fetch_array();

   $host = $app->host;
   if ($type == 'ACADEMIC') {
      if (!empty($unithd)) {
         $unit = $unithd['faculty_id'];
      } else {
         $unit = $_SESSION['user']['faculty_id'];
      }
      // $unit = $_SESSION['user']['faculty_id'];
      $pos_sql = $db->query("SELECT * FROM procurement.request AS t1 
      LEFT JOIN hr.staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
      left join hr.unit as t4 on t2.unit_id = t4.id
      LEFT JOIN hr.job AS t3 ON t2.`job_id` = t3.`id` 
      WHERE t4.faculty_id = '$unit' AND status > 0 and stage > 0 ORDER BY t1.`request_id` desc");
   } else {
      if (!empty($unithd)) {
         $unit = $unithd['parent_id'];
      } else {
         $unit = $_SESSION['user']['parent_id'];
      }
      // $unit = $_SESSION['user']['parent_id'];

      $pos_sql = $db->query("SELECT * FROM procurement.request AS t1 
      LEFT JOIN hr.staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
      left join hr.unit as t4 on t2.unit_id = t4.id
      LEFT JOIN hr.job AS t3 ON t2.`job_id` = t3.`id` 
      WHERE t4.parent_id = '$unit' AND status > 0 and stage > 0 ORDER BY t1.`request_id` desc");
   }

   $data = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   $app->render('promolayout.php', [
      'page' => 'pages/procurement/procurement_listdd.php',
      'slug' => 'procurement_listdd',
      'positions' => $data
   ]);
})->name('procurement_listdd');

$app->get('/procurement_comments', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $staff = $_SESSION['user']['staff_no'];

   $type = (isset($_SESSION['user']['type']) ? $_SESSION['user']['type'] : '');

   // die();
   $host = $app->host;
   // $unit = $_SESSION['user']['faculty_id'];
   $sql_query = "SELECT t1.*, t2.*, t3.fname, t3.mname, t3.lname,t4.total_price,t4.status, t4.stage_status from procurement.comments as t1 
left join hr.unit as t2 on t1.unit_to = t2.id
left join hr.staff as t3 on t2.unit_head = t3.staff_no or t2.unit_subhead = t3.staff_no
left join procurement.request as t4 on t1.request_id = t4.request_id
where t1.status = 0 and t2.unit_head = '$staff' or t2.unit_subhead = '$staff'";
   // echo $sql_query;
   // die();
   $pos_sql = $db->query($sql_query);


   $data = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }

   $upro_sql1 = $db->query("SELECT * from procurement.comments as t1 
    left join hr.unit as t2 on t1.unit_to = t2.id
    left join hr.staff as t3 on t2.unit_head = t3.staff_no or t2.unit_subhead = t3.staff
    where t1.status = 0 and t2.unit_head = ${staff} or t2.unit_subhead = '$staff'");

   if ($upro_sql1) {
      $data1 = [];
      if ($upro_sql1->num_rows > 0) {
         while ($row1 = $upro_sql1->fetch_assoc()) {
            $data1[] = $row1;
         }
      }
      if (!empty($data)) {
         # code...
         $_SESSION['procureset'] = $data;
      } else {
         unset($_SESSION['procureset']);
      }
   }


   // var_dump($data);die();
   $app->render('promolayout.php', [
      'page' => 'pages/procurement/procurement_comments.php',
      'slug' => 'procurement_comments',
      'positions' => $data
   ]);
})->name('procurement_comments');

$app->get('/procurement_listpr', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $staff = $_SESSION['user']['staff_no'];

   $type = (isset($_SESSION['user']['type']) ? $_SESSION['user']['type'] : '');

   $uhead = $db->query("select t1.* from hr.unit as t1
left join staff as t2 on t2.staff_no = t1.unit_head or t2.staff_no = t1.unit_subhead
left join job as t3 on t2.job_id = t3.id
where t2.staff_no = " . $staff);
   $unithd = $uhead->fetch_array();

   // die();
   $host = $app->host;
   if ($type == 'ACADEMIC') {
      if (!empty($unithd)) {
         $unit = $unithd['college_id'];
      } else {
         $unit = $_SESSION['user']['college_id'];
      }
      // $unit = $_SESSION['user']['college_id'];
      $pos_sql = $db->query("SELECT * FROM procurement.request AS t1 
      LEFT JOIN hr.staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
      left join hr.unit as t4 on t2.unit_id = t4.id
      LEFT JOIN hr.job AS t3 ON t2.`job_id` = t3.`id` 
      WHERE t4.college_id = '$unit' AND status > 0 and stage > 1 ORDER BY t1.`request_id` desc");
   } else {
      if (!empty($unithd)) {
         $unit = $unithd['parent_id'];
      } else {
         $unit = $_SESSION['user']['parent_id'];
      }
      // $unit = $_SESSION['user']['parent_id'];

      $pos_sql = $db->query("SELECT * FROM procurement.request AS t1 
      LEFT JOIN hr.staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
      left join hr.unit as t4 on t2.unit_id = t4.id
      LEFT JOIN hr.job AS t3 ON t2.`job_id` = t3.`id` 
      WHERE t4.type ='NON-ACADEMIC' AND status > 0 and stage > 1 ORDER BY t1.`request_id` desc");
   }

   $data = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   $app->render('promolayout.php', [
      'page' => 'pages/procurement/procurement_listpr.php',
      'slug' => 'procurement_listpr',
      'positions' => $data
   ]);
})->name('procurement_listpr');

$app->get('/contract_list', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $staff = $_SESSION['user']['staff_no'];
   $host = $app->host;
   $sqlp = "SELECT * FROM hr.staff_promotion AS t1 
   LEFT JOIN hr.staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
   LEFT JOIN hr.job AS t3 ON t1.`position_id` = t3.`id` WHERE t1.staff_no = $staff AND t1.type = 1";
   $pos_sql = $db->query($sqlp);

   $data = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   $app->render('promolayout.php', [
      'page' => 'pages/promotion/contract_list.php',
      'slug' => 'contract_list',
      'data' => $data
   ]);
})->name('contract_list');

$app->get('/promo_listhod', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $staff = $_SESSION['user']['staff_no'];

   $type = (isset($_SESSION['user']['type']) ? $_SESSION['user']['type'] : '');
   // echo $unit = $_SESSION['user']['unit_id'];die();

   $que = "SELECT * from hr.unit where unit_head = '$staff'";
   // echo $que;
   $qry = $db->query($que);
   // var_dump($qry);die();
   if (!empty($qry)) {
      while ($row = $qry->fetch_assoc()) {
         $ps0[] = $row;
      }
   }
   //  var_dump($ps0[0]['id']);die();
   // die();
   $host = $app->host;
   if ($type == 'ACADEMIC') {
      // echo $unit = $_SESSION['user']['unit_id'];die();
      $unit = $ps0[0]['id'];
      $pos_sql = $db->query("SELECT t1.*, t5.*, t4.* from hr.staff_promotion as t1 left join hr.unit as t2 on t1.unit_id = t2.id 
      left join hr.staff as t3 on t2.unit_head = t3.staff_no 
      LEFT JOIN job AS t4 ON t1.`position_id` = t4.`id`
      left join hr.staff as t5 on t1.staff_no = t5.staff_no 
   WHERE t2.unit_head = '$staff' and t1.unit_id = t2.id AND t1.type = 0 ORDER BY t1.`promotion_id` ASC");
   } else {
      $unit = $ps0[0]['id'];
      // echo $unit = $_SESSION['user']['unit_id'];die();

      $pos_sql = $db->query("SELECT t1.*, t5.*, t4.* from hr.staff_promotion as t1 left join hr.unit as t2 on t1.unit_id = t2.id 
      left join hr.staff as t3 on t2.unit_head = t3.staff_no 
      LEFT JOIN job AS t4 ON t1.`position_id` = t4.`id` 
      left join hr.staff as t5 on t1.staff_no = t5.staff_no   
   WHERE t2.unit_head = '$staff' and t1.unit_id = t2.id AND t1.type = 0 ORDER BY t1.`promotion_id` ASC");
   }

   $data = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   $app->render('promolayout.php', [
      'page' => 'pages/promotion/promo_listhod.php',
      'slug' => 'promo_listhod',
      'positions' => $data
   ]);
})->name('promo_listhod');

$app->get('/declaration_formhod', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $staff = $_SESSION['user']['staff_no'];

   $type = (isset($_SESSION['user']['type']) ? $_SESSION['user']['type'] : '');

   // die();
   $host = $app->host;
   if ($type == 'ACADEMIC') {
      $unit = $_SESSION['user']['unit_id'];
      $pos_sql = $db->query("SELECT *, t1.`id` FROM study_intention AS t1 LEFT JOIN staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
   LEFT JOIN job AS t3 ON t2.`job_id` = t3.`id` 
   WHERE t2.unit_id = '$unit' ORDER BY t1.`id` ASC");
   } else {
      $unit = $_SESSION['user']['unit_id'];

      $pos_sql = $db->query("SELECT *, t1.`id` FROM study_intention AS t1 LEFT JOIN staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
   LEFT JOIN job AS t3 ON t2.`job_id` = t3.`id` 
   WHERE t2.unit_id = '$unit' ORDER BY t1.`id` ASC");
   }

   $data = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   // var_dump($data);die();
   $app->render('promolayout.php', [
      'page' => 'pages/promotion/declaration_formhod.php',
      'slug' => 'declaration_formhod',
      'positions' => $data
   ]);
})->name('declaration_formhod');

$app->get('/declaration_formdd', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   // var_dump($user);
   $staff = $_SESSION['user']['staff_no'];
   $type = (isset($_SESSION['user']['type']) ? $_SESSION['user']['type'] : '');
   // var_dump($unit);
   // die();
   $host = $app->host;
   if ($type == 'ACADEMIC') {
      $unit = $_SESSION['user']['faculty_id'];
      $pos_sql = $db->query("SELECT *, t1.`id` FROM study_intention AS t1
      LEFT JOIN staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
      left join unit as t4 on t2.unit_id = t4.id
      LEFT JOIN job AS t3 ON t2.`job_id` = t3.`id` 
      WHERE t4.faculty_id = '$unit' AND appstatus > 1 ORDER BY t1.`id` ASC");
   } else {
      $unit = $_SESSION['user']['parent_id'];

      $pos_sql = $db->query("SELECT *, t1.`id` FROM study_intention AS t1
      LEFT JOIN staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
      left join unit as t4 on t2.unit_id = t4.id
      LEFT JOIN job AS t3 ON t2.`job_id` = t3.`id` 
      WHERE t4.parent_id = '$unit' AND appstatus > 1 ORDER BY t1.`id` ASC");
   }

   $data = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   // var_dump($data);die();
   $app->render('promolayout.php', [
      'page' => 'pages/promotion/declaration_formdd.php',
      'slug' => 'declaration_formdd',
      'positions' => $data
   ]);
})->name('declaration_formdd');

$app->get('/declaration_formpr', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   // var_dump($user);
   $staff = $_SESSION['user']['staff_no'];
   $type = (isset($_SESSION['user']['type']) ? $_SESSION['user']['type'] : '');
   // var_dump($unit);
   // die();
   $host = $app->host;
   if ($type == 'ACADEMIC') {
      $unit = $_SESSION['user']['college_id'];
      $pos_sql = $db->query("SELECT *, t1.`id` FROM study_intention AS t1
      LEFT JOIN staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
      left join unit as t4 on t2.unit_id = t4.id
      LEFT JOIN job AS t3 ON t2.`job_id` = t3.`id` 
      WHERE t4.college_id = '$unit' AND appstatus > 2 ORDER BY t1.`id` ASC");
   } else {
      $unit = $_SESSION['user']['parent_id'];

      $pos_sql = $db->query("SELECT *, t1.`id` FROM study_intention AS t1
      LEFT JOIN staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
      left join unit as t4 on t2.unit_id = t4.id
      LEFT JOIN job AS t3 ON t2.`job_id` = t3.`id` 
      WHERE t3.type ='NON-ACADEMIC' AND appstatus > 2 ORDER BY t1.`id` ASC");
   }

   $data = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   // var_dump($data);die();
   $app->render('promolayout.php', [
      'page' => 'pages/promotion/declaration_formpr.php',
      'slug' => 'declaration_formpr',
      'positions' => $data
   ]);
})->name('declaration_formpr');


$app->get('/contract_listhod', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $staff = $_SESSION['user']['staff_no'];
   $unit = $_SESSION['user']['unit_id'];
   // die();
   $host = $app->host;
   $pos_sql = $db->query("SELECT * FROM staff_promotion AS t1 LEFT JOIN staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
   LEFT JOIN job AS t3 ON t1.`position_id` = t3.`id` 
   WHERE t1.unit_id = '$unit' AND t1.type = 1 ORDER BY t1.`promotion_id` ASC");

   $data = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   $app->render('promolayout.php', [
      'page' => 'pages/promotion/contract_listhod.php',
      'slug' => 'contract_listhod',
      'positions' => $data
   ]);
})->name('contract_listhod');

$app->get('/promo_listdd', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   // var_dump($user);
   $staff = $_SESSION['user']['staff_no'];
   $type = (isset($_SESSION['user']['type']) ? $_SESSION['user']['type'] : '');
   // var_dump($_SESSION['user']['type']);
   // die();
   $que = "SELECT * from hr.unit where unit_head = '$staff'";
   // echo $que;
   $qry = $db->query($que);
   // var_dump($qry);die();
   if (!empty($qry)) {
      while ($row = $qry->fetch_assoc()) {
         $ps0[] = $row;
      }
   }
   //  var_dump($ps0);
   //  foreach($ps0 as $pid){
   //    echo $fid = $pid['faculty_id'].',';
   //  }
   //  echo $fid;
   //  die();

   $host = $app->host;
   if ($type == 'ACADEMIC') {
      $unit = $ps0[0]['faculty_id'];

      // $unit = $_SESSION['user']['faculty_id'];die();
      $pos_sql = $db->query("SELECT t1.*,t2.*,t3.*,t4.* FROM staff_promotion AS t1 
         LEFT JOIN staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
         left join unit as t4 on t2.unit_id = t4.id
         LEFT JOIN job AS t3 ON t1.`position_id` = t3.`id`
         left join hr.unit as t5 on t4.faculty_id = t5.id 
         WHERE t5.unit_head = '$staff' AND promo_status > 1 AND t1.type = 0 ORDER BY t1.`promotion_id` ASC");
   } else {
      $unit = $ps0[0]['parent_id'];
      // $unit = $_SESSION['user']['parent_id'];

      $pos_sql = $db->query("SELECT * FROM staff_promotion AS t1 
      LEFT JOIN staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
      left join unit as t4 on t2.unit_id = t4.id
      LEFT JOIN job AS t3 ON t1.`position_id` = t3.`id` 
      WHERE t4.parent_id = '$unit' AND promo_status > 1 AND t1.type = 0 ORDER BY t1.`promotion_id` ASC");
   }

   $data = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   $app->render('promolayout.php', [
      'page' => 'pages/promotion/promo_listdd.php',
      'slug' => 'promo_listdd',
      'positions_dean' => $data
   ]);
})->name('promo_listdd');

$app->get('/contract_listdd', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   // var_dump($user);
   $staff = $_SESSION['user']['staff_no'];
   $unit = $_SESSION['user']['faculty_id'];
   // var_dump($unit);
   // die();
   $host = $app->host;
   $pos_sql = $db->query("SELECT * FROM staff_promotion AS t1 
   LEFT JOIN staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
   left join unit as t4 on t2.unit_id = t4.id
   LEFT JOIN job AS t3 ON t1.`position_id` = t3.`id` 
   WHERE t4.faculty_id = '$unit' AND promo_status > 1 AND t1.type = 1 ORDER BY t1.`promotion_id` ASC");

   $data = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   $app->render('promolayout.php', [
      'page' => 'pages/promotion/contract_listdd.php',
      'slug' => 'contract_listdd',
      'positions_dean' => $data
   ]);
})->name('contract_listdd');

$app->get('/promo_listpr', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $staff = $_SESSION['user']['staff_no'];
   // $unit = $_SESSION['user']['unit_id'];

   $type = (isset($_SESSION['user']['type']) ? $_SESSION['user']['type'] : '');
   // die();

   $que = "SELECT * from hr.unit where unit_head = '$staff'";
   // echo $que;
   $qry = $db->query($que);
   // var_dump($qry);die();
   if (!empty($qry)) {
      while ($row = $qry->fetch_assoc()) {
         $ps0[] = $row;
      }
   }

   // var_dump($unit);
   // die();
   $host = $app->host;
   if ($type == 'ACADEMIC') {
      $unit = $ps0[0]['college_id'];

      // $unit = $_SESSION['user']['college_id'];
      $pos_sql = $db->query("SELECT * FROM staff_promotion AS t1 
      LEFT JOIN staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
      left join unit as t4 on t2.unit_id = t4.id
      LEFT JOIN job AS t3 ON t1.`position_id` = t3.`id` 
			left join hr.unit as t5 on t4.college_id = t5.id 
      WHERE t5.unit_head = '$staff' AND promo_status > 2 AND t1.type = 0 ORDER BY t1.`promotion_id` ASC");
      // $pos_sql = $db->query("SELECT * FROM staff_promotion AS t1 
      // LEFT JOIN staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
      // left join unit as t4 on t2.unit_id = t4.id
      // LEFT JOIN job AS t3 ON t1.`position_id` = t3.`id` 
      // WHERE t4.college_id = '$unit' AND promo_status > 2 AND t1.type = 0 ORDER BY t1.`promotion_id` ASC");
   } else {
      $unit = $ps0[0]['parent_id'];
      // $unit = $_SESSION['user']['parent_id'];

      $pos_sql = $db->query("select * from staff_promotion as t1
left join staff as t2 on t2.staff_no=t1.staff_no
left join unit as t3 on t3.id=t2.unit_id
left join unit as t4 on t4.id=t3.parent_id
where  t3.type ='NON-ACADEMIC' AND promo_status > 2 AND t1.type = 0 ORDER BY t1.`promotion_id` ASC");
   }
   // var_dump($pos_sql);
   // die();
   $asses = $db->query("SELECT * FROM `assessors` WHERE active = 0");

   $data = [];
   $data_as = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   if ($asses->num_rows > 0) {
      while ($row = $asses->fetch_assoc()) {
         $data_as[] = $row;
      }
   }
   $app->render('promolayout.php', [
      'page' => 'pages/promotion/promo_listpr.php',
      'slug' => 'promo_listpr',
      'positions' => $data,
      'assessor' => $data_as
   ]);
})->name('promo_listpr');

$app->get('/contract_listpr', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $staff = $_SESSION['user']['staff_no'];
   // $unit = $_SESSION['user']['unit_id'];
   $unit = $_SESSION['user']['college_id'];
   // die();
   $host = $app->host;
   $pos_sql = $db->query("SELECT * FROM staff_promotion AS t1 
   LEFT JOIN staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
   left join unit as t4 on t2.unit_id = t4.id
   LEFT JOIN job AS t3 ON t1.`position_id` = t3.`id` 
   WHERE t4.college_id = '5200' AND promo_status > 1 AND t1.type = 1 ORDER BY t1.`promotion_id` ASC");
   // var_dump($pos_sql);
   // die();
   $asses = $db->query("SELECT * FROM `assessors` WHERE active = 0");

   $data = [];
   $data_as = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   if ($asses->num_rows > 0) {
      while ($row = $asses->fetch_assoc()) {
         $data_as[] = $row;
      }
   }
   $app->render('promolayout.php', [
      'page' => 'pages/promotion/contract_listpr.php',
      'slug' => 'contract_listpr',
      'positions' => $data,
      'assessor' => $data_as
   ]);
})->name('contract_listpr');


$app->get('/appraisal_a', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $staff = $_SESSION['user']['staff_no'];
   $host = $app->host;
   $year = date("Y");
   $pos_sql = $db->query("SELECT * FROM staff_self_appraisal AS t1
   LEFT JOIN staff AS t2 ON t1.`staff_no` = t2.`staff_no`
   LEFT JOIN job AS t3 ON t2.`job_id` = t3.`id`
   LEFT JOIN unit AS t4 ON t2.`unit_id` = t4.`id`
   WHERE t1.`staff_no` = $staff AND t1.`activity_date` LIKE '%$year%'");

   $uh = $db->query("SELECT t1.`first_appoint_date`, t1.`staff_no`, t4.`app_status` AS app_self_status,t1.`title`,t1.`fname`, t1.`mname`, t1.`lname`, t1.`dob`, t1.`phone`,t1.`unit_id`, t1.`ucc_mail`, 
   t1.`appoint_date`,t2.`short_name`, t2.`long_name`, t2.`parent_flag`, t2.`type`, t3.`title` AS jobtitle,t3.`type` AS jobtype FROM staff AS t1
   LEFT JOIN staff_self_appraisal AS t4 ON t4.`staff_no` = t1.`staff_no`
   LEFT JOIN unit AS t2 ON t1.`unit_id` = t2.`id`
   LEFT JOIN job AS t3 ON t1.`job_id` = t3.`id`
   WHERE t1.unit_id = 5202 AND t1.staff_status = 'PERMANENT' ORDER BY t4.`app_self_id` DESC");

   $st = $db->query("SELECT * FROM staff AS t1 
   LEFT JOIN job AS t2 ON t1.`job_id` = t2.`id` 
   WHERE t1.`staff_no` = $staff");

   $data = [];
   $data_row = [];
   $st_data = [];
   if ($pos_sql->num_rows > 0) {
      while ($row = $pos_sql->fetch_assoc()) {
         $data[] = $row;
      }
   }
   if ($uh->num_rows > 0) {
      while ($row = $uh->fetch_assoc()) {
         $data_row[] = $row;
      }
   }
   if ($st->num_rows > 0) {
      while ($row = $st->fetch_assoc()) {
         $st_data[] = $row;
      }
   }
   $app->render('promolayout.php', [
      'page' => 'pages/appraisal/appraisal_a.php',
      'slug' => 'appraisal_a',
      'userhead' => $data_row,
      'staff' => $st_data,
      'appstaff' => $data
   ]);
})->name('appraisal_a');

$app->get('/appraisal_b', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $staff = $_SESSION['user']['staff_no'];
   $host = $app->host;
   $year = date("Y");

   $appraisal_b_filled1 = "SELECT DISTINCT t2.`cat_name`, t6.`long_name`, t1.`app_id` AS staff_app_id, t1.`app_status`, t1.`supervisor_name`, t1.`supervisors_rank`, t1.`yr_onreview`, 
   t1.`sup_signed`, t1.`emp_signed`, t1.`purpose_curr_review`, t1.`curr_year_obj`, t4.`fname`, t4.`mname`, t4.`lname`, t4.`staff_no`, t4.`ucc_mail`, t4.`phone`, 
   t4.`appoint_date`, t5.`title` AS jobtitle, t1.`dev_needs`, t1.`overall_summary`, t1.`sup_rating`, t1.`emp_comments`, GROUP_CONCAT(t3.`question`,'|',t1.`reply`,'|',t1.`eg` 
   ORDER BY t3.`question_id` ASC SEPARATOR ':') AS question
   FROM staff_appraisal AS t1
   LEFT JOIN appraisal_question AS t3 ON t1.`question` = t3.`question_id`
   LEFT JOIN appraisal_cat AS t2 ON t3.`cat_id` = t2.`cat_id`
   LEFT JOIN staff AS t4 ON t1.`staff_no` = t4.`staff_no`
   LEFT JOIN job AS t5 ON t4.`job_id` = t5.`id`
   LEFT JOIN unit AS t6 ON t4.`unit_id` = t6.`id`
   WHERE t1.`staff_no` = $staff AND t1.`activity_date` LIKE '%2021%' GROUP BY t2.`cat_id`, t1.`app_id`, t2.`cat_name`";

   // var_dump($appraisal_b_filled1);
   // die();
   $appraisal_b_filled = $db->query($appraisal_b_filled1);

   $appraisal_b1 = $db->query("SELECT DISTINCT t2.`cat_name`, t2.`cat_id`, GROUP_CONCAT(t1.`question`,'|',t1.`question_id` ORDER BY  t1.`question_id` ASC SEPARATOR ':') AS question
   FROM `appraisal_question` AS t1
   LEFT JOIN `appraisal_cat` AS t2 ON t1.`cat_id` = t2.`cat_id`
   WHERE t1.`which_staff` = 1 OR t1.`which_staff` = 2 OR t1.`which_staff` = 3 GROUP BY t2.`cat_id`");

   $getstdata1 = $db->query("SELECT * FROM staff AS t1 
   LEFT JOIN job AS t2 ON t1.`job_id` = t2.`id` WHERE t1.`staff_no` = $staff");

   $getstaffApp = $db->query("SELECT t1.`first_appoint_date`, t1.`staff_no`, t4.`app_status` AS app_self_status,t1.`title`,t1.`fname`, t1.`mname`, t1.`lname`, t1.`dob`, t1.`phone`,t1.`unit_id`, t1.`ucc_mail`, 
   t1.`appoint_date`,t2.`short_name`, t2.`long_name`, t2.`parent_flag`, t2.`type`, t3.`title` AS jobtitle,t3.`type` AS jobtype FROM staff AS t1
   LEFT JOIN staff_self_appraisal AS t4 ON t4.`staff_no` = t1.`staff_no`
   LEFT JOIN unit AS t2 ON t1.`unit_id` = t2.`id`
   LEFT JOIN job AS t3 ON t1.`job_id` = t3.`id`
   WHERE t1.unit_id = 5202 AND t1.staff_status = 'PERMANENT' ORDER BY t4.`app_self_id` DESC");

   $appraisal_b_data = [];
   $appraisal_b = [];
   $getstdata = [];
   $userhead = [];
   if ($appraisal_b_filled->num_rows > 0) {
      while ($row = $appraisal_b_filled->fetch_assoc()) {
         $appraisal_b_data[] = $row;
      }
   }
   if ($appraisal_b1->num_rows > 0) {
      while ($row = $appraisal_b1->fetch_assoc()) {
         $appraisal_b[] = $row;
      }
   }
   if ($getstdata1->num_rows > 0) {
      while ($row = $getstdata1->fetch_assoc()) {
         $getstdata[] = $row;
      }
   }
   if ($getstaffApp->num_rows > 0) {
      while ($row = $getstaffApp->fetch_assoc()) {
         $userhead[] = $row;
      }
   }
   $app->render('promolayout.php', [
      'page' => 'pages/appraisal/appraisal_b.php',
      'slug' => 'appraisal_b',
      'appraisal_b_data' => $appraisal_b_data,
      'appraisal_b' => $appraisal_b,
      'getstdata' => $getstdata,
      'userhead' => $userhead
   ]);
})->name('appraisal_b');


// Promotion Statistics Page
$app->get('/promostat', function () use ($app) {
   $app->render('mainlayout.php', [
      'page' => 'pages/promotion/promostat.php',
      'slug' => 'leavestat'
   ]);
});


// Promotion Statistics Report
$app->get('/promostatrep', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $staff = $_SESSION['user']['staff_no'];
   $row_sql = $db->query("select l.id as lid,t.title,year(applied_date) as year,date_format(applied_date,'%a %b %d, %Y') as adate,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.*,s.*,t.*,concat(r.lname,', ',r.fname,' ',r.mname,' (',l.relieved_by,')') as relieve,concat(u.lname,', ',u.fname,' ',ifnull(u.mname,''),' (',l.head_endorse,')') as uhead,concat(h.lname,', ',h.fname,' ',h.mname,' (',l.hr_endorse,')') as hhead from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id left join staff r on r.staff_no = l.relieved_by left join staff u on u.staff_no = l.head_endorse left join staff h on h.staff_no = l.hr_endorse where l.staff_no = " . $staff . " order by year(applied_date) desc,lid desc,t.title,l.status");
   $rows = [];
   if ($row_sql->num_rows > 0) {
      while ($row = $row_sql->fetch_array()) {
         $row['photo'] = isPhoto($row['photo']);
         $rows[] = $row;
      }
   }
   if (count($rows) > 0) {
      $app->render('reportlayout.php', [
         'page' => 'pages/leave/rep_leavestat.php',
         'slug' => 'leavestat',
         'title' => 'LEAVE STATISTICS',
         'data' => $rows
      ]);
   } else {
      echo '<div style="width:100%;margin:0px auto 10px 80px;"><img src="public/images/zero.png"</div>';
   }
});



// Leave Form Report
$app->get('/promoformrep/:sno', 'authenticate', function ($sno) use ($app) {
   require_once './config/db.php';
   $row_sql = $db->query("select l.id as lid,j.title as jobtitle, year(applied_date) as year,date_format(applied_date,'%a %b %d, %Y') as adate,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.*,s.*,t.*,l.emergency_contact,concat(r.lname,', ',r.fname,' ',r.mname,' (',l.relieved_by,')') as relieve,concat(u.lname,', ',u.fname,' ',ifnull(u.mname,''),' (',l.head_endorse,')') as uhead,concat(h.lname,', ',h.fname,' ',h.mname,' (',l.hr_endorse,')') as hhead from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join promotion p on p.id = s.promo_id left join job j on j.id  = p.job_id left join leave_type t on t.id = l.type_id left join staff r on r.staff_no = l.relieved_by left join staff u on u.staff_no = l.head_endorse left join staff h on h.staff_no = l.hr_endorse where l.id =" . $sno);
   $rows = null;
   if ($row_sql->num_rows > 0) {
      $row = $row_sql->fetch_assoc();
      $row['photo'] = isPhoto($row['photo']);
   }
   $app->render('reportlayout.php', [
      'page' => 'pages/leave/rep_leaveform.php',
      'slug' => 'leaveform',
      'title' => 'LEAVE FORM',
      'data' => $row
   ]);
});


/* CIRCULAR MODULE */

// CIRCULARS POPULATED
$app->get('/circular', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $staff = $_SESSION['user']['staff_no'];
   $rows = [];
   // Job Category Circulars
   $row_sql = $db->query("select *,date_format(created_at,'%M %d, %Y') as created_at from circular where find_in_set(" . $_SESSION['user']['job_id'] . ",cat_job_id) > 0 and `status` > 0");
   if ($row_sql->num_rows > 0) {
      while ($row = $row_sql->fetch_array()) {
         $row['attachment'] = $_SESSION['settings']['assethost'] . substr($row['attachment'], 7);
         $row['copied'] = 'ALL ' . $_SESSION['user']['jobtitle'];
         $rows['c' . $row['id']] = $row;
      }
   }
   // Unit Members Members Circulars
   $row_sql = $db->query("select *,date_format(created_at,'%M %d, %Y') as created_at from circular  where find_in_set(" . $_SESSION['user']['unit_id'] . ",cat_unit_id) > 0 and cat_unit_status = 'ALL' and `status` > 0");
   if ($row_sql->num_rows > 0) {
      while ($row = $row_sql->fetch_array()) {
         $row['attachment'] = $_SESSION['settings']['assethost'] . substr($row['attachment'], 7);
         $row['copied'] = 'MEMBERS, ' . $_SESSION['user']['long_name'];
         $rows['c' . $row['id']] = $row;
      }
   }
   // Unit Heads Circulars
   $row_sql = $db->query("select c.*,date_format(c.created_at,'%M %d, %Y') as created_at from circular c left join unit u on find_in_set(u.id,cat_unit_id) > 0 where c.cat_unit_status = 'HOD' and `status` > 0 and (u.unit_head = '" . $_SESSION['user']['staff_no'] . "' or u.unit_subhead  = '" . $_SESSION['user']['staff_no'] . "')");
   if ($row_sql->num_rows > 0) {
      while ($row = $row_sql->fetch_array()) {
         $row['attachment'] = $_SESSION['settings']['assethost'] . substr($row['attachment'], 7);
         $row['copied'] = 'HEAD, ' . $_SESSION['user']['long_name'];
         $rows['c' . $row['id']] = $row;
      }
   }
   // Staff Category Circulars
   $row_sql = $db->query("select *,date_format(created_at,'%M %d, %Y') as created_at from circular where find_in_set('" . $_SESSION['user']['staff_group'] . "',cat_staff_group) > 0 and `status` > 0");
   if ($row_sql->num_rows > 0) {
      while ($row = $row_sql->fetch_array()) {
         $row['attachment'] = $_SESSION['settings']['assethost'] . substr($row['attachment'], 7);
         $row['copied'] = $_SESSION['user']['staff_group'] == 'SM' ? 'ALL SENIOR MEMBERS' : ($_SESSION['user']['staff_group'] == 'SS' ? 'ALL SENIOR STAFF' : 'ALL JUNIOR STAFF');
         $rows['c' . $row['id']] = $row;
      }
   }
   // Staff Included Circulars
   $row_sql = $db->query("select *,date_format(created_at,'%M %d, %Y') as created_at from circular where find_in_set(" . $_SESSION['user']['staff_no'] . ",cat_staff_no) > 0 and `status` > 0");
   if ($row_sql->num_rows > 0) {
      while ($row = $row_sql->fetch_array()) {
         $row['attachment'] = $_SESSION['settings']['assethost'] . substr($row['attachment'], 7);
         $row['copied'] = 'INCLUDED MEMBER';
         $rows['c' . $row['id']] = $row;
      }
   }

   $rows = array_values($rows);
   $rows = array_map("unserialize", array_unique(array_map("serialize", $rows)));
   $id = array_column($rows, 'id');
   array_multisort($id, SORT_DESC, $rows);
   $app->render('mainlayout.php', [
      'page' => 'pages/circular/notice.php',
      'slug' => 'circular',
      'data' => $rows
   ]);
})->name('circular');



// CLOSE CIRCULAR INTRO MODAL
$app->get('/intro_close', 'authenticate', function () use ($app) {
   $_SESSION['user']['circulars'] = null;
   unset($_SESSION['user']['circulars']);
   $app->redirect($app->urlFor('circular'));
})->name('intro_close');



/*  HEAD OF UNIT MODULE  */

// UNIT MEMBERS
$app->get('/members', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $staff = $_SESSION['user']['staff_no'];
   $row_sql = $db->query("select s.staff_no as nox,s.*,DATE_FORMAT(dob,'%d/%m/%Y') as dobx,b.*,u.long_name,sc.notch,sc.grade as title,j.title as jobtitle from staff s left join bank b on b.id = s.bank_id left join promotion p on p.id = s.promo_id left join scale sc on sc.id = p.scale_id left join unit u on p.unit_id = u.id left join job j on p.job_id = j.id where (u.unit_head = " . $staff . " or u.unit_subhead = " . $staff . ") and s.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE')");
   $rows = [];
   if ($row_sql->num_rows > 0) {
      while ($row = $row_sql->fetch_array()) {
         //$row['photo'] = isPhoto($row['photo']);
         $row['photo'] = 'https://cdn.ucc.edu.gh/photos/?tag=' . $row['staff_no'];
         $rows[] = $row;
      }
   }
   $app->render('mainlayout.php', [
      'page' => 'pages/head/member.php',
      'slug' => 'members',
      'data' => $rows
   ]);
})->name('members');

$app->get('/stud_list', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $staff = $_SESSION['user']['staff_no'];

   $upro_sql3 = $db->query("SELECT * from academic_advisers 
   where staff_no = '$staff' and approved = 0 and stage_status = 0 and status = 1");

   if ($upro_sql3) {
      $data1 = [];
      if ($upro_sql3->num_rows > 0) {
         while ($row1 = $upro_sql3->fetch_assoc()) {
            $data1[] = $row1;
         }
      }
      // var_dump($data1['level_ass']);die();
      $level_ass = $data1[0]['level_ass'];
      $progid = $data1[0]['progid'];
      if (!empty($data1)) {
         $upro_sql2 = $db->query("SELECT distinct t1.studid, t1.Regno,concat(t1.lname,', ',t1.fname,' ',ifnull(t1.mname,' ')) Name,
               t1.cellphone, t1.inst_email, t1.sex,
               round(sum(if(t2.audit!=1,t3.credits,0)*t4.value)/sum(if(t2.audit!=1,t3.credits,0)),3) CGPA, t11.sender_id, t11.receiver, doa, t6.long_name Programme
               from osissp.assmain as t2 
               left join osis.students_db as t1 on t1.studid=t2.studid
               left join osissp.asshead as t3 on t2.assheadcode=t3.assheadcode and t2.courseid=t3.courseid and t2.groupnum=t3.groupnum and t2.resit = t3.resit
               left join osispref.trial_grades as t4 on t2.grade=t4.grade
               left join osispref.classes as t5 on t5.scheme_id=t4.scheme
               left join osis.prog_db as t6 on t6.progid=t2.progid
               left join osis.major_db as t7 on t7.majorid=t1.majorid
               left join osis.course_db as t8 on t8.courseid=t2.courseid
               left join osis.degree_category as t9 on t9.degreeid=t6.degreeid
               left join osis.faculty as t10 on t6.facultyid = t10.facultyid
               left join hr.adviserschatlog as t11 on t2.studid = t11.sender_id or t2.studid = t11.receiver
               left join hr.academic_advisers as t12 on t12.staff_no = $staff
               WHERE t2.session BETWEEN 20161 and 20231 AND t6.runtype=1 and t6.progtype = '01'
               AND t1.level = '$level_ass' and t1.progid = '$progid' and  t1.completed=0 and entrylevel = 100 and graduate=0 and t12.staff_no = $staff
               group by t1.studid, t1.regno, t1.lname, t1.fname, t1.mname, t1.sex, doa, t6.long_name, receiver,sender_id
               ORDER BY CGPA DESC");

         if ($upro_sql2) {
            $data2 = [];
            if ($upro_sql2->num_rows > 0) {
               while ($row2 = $upro_sql2->fetch_assoc()) {
                  $data2[] = $row2;
               }
            }
            // var_dump($data2);die();
            if (!empty($data2)) {
               # code...
               $_SESSION['stud_aca'] = $data2;
            } else {
               unset($_SESSION['stud_aca']);
            }
         }
         # code...
         $_SESSION['advisers'] = $data1;
      } else {
         unset($_SESSION['advisers']);
      }
   }
   // $rows = [];
   // if($upro_sql2->num_rows > 0){
   //    while($row = $upro_sql2->fetch_array()){
   //        //$row['photo'] = isPhoto($row['photo']);
   //        $row['photo'] = 'https://cdn.ucc.edu.gh/photos/?tag='.$row['staff_no'];
   //        $rows[] = $row;
   //    }
   // }
   $app->render('mainlayout.php', [
      'page' => 'pages/head/stud_list.php',
      'slug' => 'stud_list',
      'ass_data' => $data1,
      'data' => $_SESSION['stud_aca']
   ]);
})->name('stud_list');

$app->get('/add_advisers', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $staff = $_SESSION['user']['staff_no'];
   $row_sql = $db->query("select s.staff_no as nox,s.*,DATE_FORMAT(dob,'%d/%m/%Y') as dobx,b.*,u.long_name,sc.notch,sc.grade as title,
   j.title as jobtitle, t1.level_ass, t1.progid, t6.long_name as class_name from staff s left join bank b on b.id = s.bank_id 
   left join promotion p on p.id = s.promo_id left join scale sc on sc.id = p.scale_id 
   left join unit u on p.unit_id = u.id left join job j on p.job_id = j.id
   left join academic_advisers as t1 on t1.staff_no = s.staff_no
   left join osis.prog_db as t6 on t1.progid=t6.progid
   where j.type = 'ACADEMIC' and s.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE') 
   and u.type = 'ACADEMIC' order by u.long_name");
   $rows = [];
   if ($row_sql->num_rows > 0) {
      while ($row = $row_sql->fetch_array()) {
         //$row['photo'] = isPhoto($row['photo']);
         $row['photo'] = 'https://cdn.ucc.edu.gh/photos/?tag=' . $row['staff_no'];
         $rows[] = $row;
      }
   }
   $app->render('mainlayout.php', [
      'page' => 'pages/head/add_advisers.php',
      'slug' => 'add_advisers',
      'data' => $rows
   ]);
})->name('add_advisers');

$app->get('/aca_ad_approve', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $staff = $_SESSION['user']['staff_no'];
   $que = "SELECT * from hr.unit where unit_head = '$staff'";
   // echo $que;
   $qry = $db->query($que);
   // var_dump($qry);die();
   if (!empty($qry)) {
      while ($row = $qry->fetch_assoc()) {
         $ps0[] = $row;
      }
   }
   $host = $app->host;

   $unit = $ps0[0]['faculty_id'];
   $level = $ps0[0]['level'];
   $unit = $ps0[0]['faculty_id'];
   $unit = $ps0[0]['college_id'];
   $unit = $ps0[0]['dept_id'];

   if ($level == 3) {
      $row_sql = $db->query("SELECT t1.*,t2.*,t3.*,t4.*,t2.staff_no as nox, t3.title as jobtitle FROM academic_advisers AS t1 
      LEFT JOIN staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
      left join unit as t4 on t2.unit_id = t4.id
      LEFT JOIN job AS t3 ON t2.`job_id` = t3.`id`
      left join hr.unit as t5 on t4.dept_id = t5.id 
      WHERE (t5.unit_head = '$staff' or t5.unit_subhead = '$staff') and 
      t2.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE') AND status > 0 ORDER BY t1.`id` ASC");
   }

   if ($level == 2) {
      $row_sql = $db->query("SELECT t1.*,t2.*,t3.*,t4.*,t2.staff_no as nox, t3.title as jobtitle FROM academic_advisers AS t1 
      LEFT JOIN staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
      left join unit as t4 on t2.unit_id = t4.id
      LEFT JOIN job AS t3 ON t2.`job_id` = t3.`id`
      left join hr.unit as t5 on t4.faculty_id = t5.id 
      WHERE (t5.unit_head = '$staff' or t5.unit_subhead = '$staff') and 
      t2.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE') AND status > 0 ORDER BY t1.`id` ASC");
   }

   if ($level == 1) {
      $row_sql = $db->query("SELECT t1.*,t2.*,t3.*,t4.*,t2.staff_no as nox, t3.title as jobtitle FROM academic_advisers AS t1 
      LEFT JOIN staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
      left join unit as t4 on t2.unit_id = t4.id
      LEFT JOIN job AS t3 ON t2.`job_id` = t3.`id`
      left join hr.unit as t5 on t4.college_id = t5.id 
      WHERE (t5.unit_head = '$staff' or t5.unit_subhead = '$staff') and 
      t2.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE') AND status > 0 ORDER BY t1.`id` ASC");
   }

   $rows = [];
   if ($row_sql->num_rows > 0) {
      while ($row = $row_sql->fetch_array()) {
         //$row['photo'] = isPhoto($row['photo']);
         $row['photo'] = 'https://cdn.ucc.edu.gh/photos/?tag=' . $row['staff_no'];
         $rows[] = $row;
      }
   }
   // var_dump($rows);die();
   $app->render('mainlayout.php', [
      'page' => 'pages/head/aca_advisers_list.php',
      'slug' => 'aca_ad_approve',
      'hd_data' => $ps0,
      'data' => $rows
   ]);
})->name('aca_ad_approve');


// UNIT MEMBERS
$app->get('/memlist/:unit', 'authenticate', function ($unit) use ($app) {
   require_once './config/db.php';
   $staff = $_SESSION['user']['staff_no'];
   $unit = strtolower(urldecode($unit));
   $row_sql = $db->query("select distinct s.staff_no,u.*,s.photo,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname) as name,s.phone,s.ucc_mail,j.title from staff s left join promotion p on s.promo_id = p.id left join unit u  on p.unit_id = u.id left join job j on j.id = p.job_id where s.staff_status in ('TEMPORAL','PERMANENT') and lower(u.long_name) = '" . $unit . "' order by s.staff_no");
   $rows = [];
   if ($row_sql->num_rows > 0) {
      while ($row = $row_sql->fetch_array()) {
         $rows[] = $row;
      }
   }
   $app->render('pages/head/memlist.php', ['rows' => $rows]);
})->name('memlist');



// UNIT LEAVE
$app->get('/unitleave', 'authenticate', function () use ($app) {
   require_once './config/db.php';
   $staff = $_SESSION['user']['staff_no'];
   // New rules
   $data = [];
   $excludes = [];
   $assigned = [];
   /* Includers */
   $unit1_sql = $db->query("select distinct s.staff_no as nox,s.staff_no,p.unit_id,p.job_id,s.flag_leave_lock,s.photo,s.fname,s.mname,s.lname,s.phone,s.ucc_mail,s.flag_leave,u.long_name,u.unit_head,u.unit_subhead,j.title as jobtitle from staff s left join promotion p on p.id = s.promo_id left join unit u on p.unit_id = u.id left join job j on p.job_id = j.id where (u.unit_head = " . $staff . " or u.unit_subhead = " . $staff . ") and s.staff_no <> " . $staff . " and j.type = 'NON-ACADEMIC' and s.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE')");
   $unit2_sql = $db->query("select s.staff_no as nox,s.staff_no,p.unit_id,p.job_id,s.flag_leave_lock,s.photo,s.fname,s.mname,s.lname,s.phone,s.ucc_mail,s.flag_leave,u.long_name,u.unit_head,u.unit_subhead,j.title as jobtitle from leave_approver l left join promotion p on find_in_set(p.unit_id,l.value) > 0 left join staff s on p.id = s.promo_id left join job j on j.id = p.job_id left join unit u on p.unit_id = u.id where l.field = 'unit_id' and j.type = 'NON-ACADEMIC' and s.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE') and l.approver = " . $staff . " and s.staff_no <> " . $staff . " and s.staff_no is not null");
   $job_sql = $db->query("select s.staff_no as nox,s.staff_no,p.unit_id,p.job_id,s.flag_leave_lock,s.photo,s.fname,s.mname,s.lname,s.phone,s.ucc_mail,s.flag_leave,u.long_name,u.unit_head,u.unit_subhead,j.title as jobtitle from leave_approver l left join promotion p on find_in_set(p.job_id,l.value) > 0 left join staff s on p.id = s.promo_id left join job j on j.id = p.job_id left join unit u on p.unit_id = u.id where l.field = 'job_id' and j.type = 'NON-ACADEMIC' and s.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE') and l.approver = " . $staff . " and s.staff_no <> " . $staff . " and s.staff_no is not null");
   $sno_sql = $db->query("select s.staff_no as nox,s.staff_no,p.unit_id,p.job_id,s.flag_leave_lock,s.photo,s.fname,s.mname,s.lname,s.phone,s.ucc_mail,s.flag_leave,u.long_name,u.unit_head,u.unit_subhead,j.title as jobtitle from leave_approver l left join staff s on l.value = s.staff_no left join promotion p on p.id = s.promo_id left join job j on j.id = p.job_id left join unit u on p.unit_id = u.id where l.field = 'staff_no' and j.type = 'NON-ACADEMIC' and s.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE') and l.approver = " . $staff . " and s.staff_no <> " . $staff . " and s.staff_no is not null");
   if ($unit1_sql->num_rows > 0) {
      while ($row = $unit1_sql->fetch_array()) {
         $data[] = $row;
      }
   }
   if ($unit2_sql->num_rows > 0) {
      while ($row = $unit2_sql->fetch_array()) {
         $data[] = $row;
      }
   }
   if ($job_sql->num_rows > 0) {
      while ($row = $job_sql->fetch_array()) {
         $data[] = $row;
      }
   }
   if ($sno_sql->num_rows > 0) {
      while ($row = $sno_sql->fetch_array()) {
         $data[] = $row;
      }
   }
   /* Excluders - Assigned to different approvers */
   $unite_sql = $db->query("select s.staff_no,p.unit_id,p.job_id from leave_approver l left join promotion p on find_in_set(p.unit_id,l.value) > 0 left join staff s on p.id = s.promo_id left join job j on j.id = p.job_id where l.field = 'unit_id' and j.type = 'NON-ACADEMIC' and s.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE') and l.approver <> " . $staff . " and s.staff_no is not null");
   $jobe_sql = $db->query("select s.staff_no,p.unit_id,p.job_id from leave_approver l left join promotion p on find_in_set(p.job_id,l.value) > 0 left join staff s on p.id = s.promo_id left join job j on j.id = p.job_id where l.field = 'job_id' and j.type = 'NON-ACADEMIC' and s.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE') and l.approver <> " . $staff . " and s.staff_no is not null");
   $snoe_sql = $db->query("select s.staff_no,p.unit_id,p.job_id from leave_approver l left join staff s on l.value = s.staff_no left join promotion p on p.id = s.promo_id left join job j on j.id = p.job_id where l.field = 'staff_no' and j.type = 'NON-ACADEMIC' and s.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE') and l.approver <> " . $staff . " and s.staff_no is not null");
   if ($unite_sql->num_rows > 0) {
      while ($row = $unite_sql->fetch_array()) {
         $excludes[] = $row;
      }
   }
   if ($jobe_sql->num_rows > 0) {
      while ($row = $jobe_sql->fetch_array()) {
         $excludes[] = $row;
      }
   }
   if ($snoe_sql->num_rows > 0) {
      while ($row = $snoe_sql->fetch_array()) {
         $excludes[] = $row;
      }
   }
   if (is_countable($excludes) && count($excludes) > 0) {
      foreach ($excludes as $row) {
         array_filter($data, function ($item) use ($row) {
            return $item['staff_no'] != $row['staff_no'];
         });
      }
   }
   $data = array_map("unserialize", array_unique(array_map("serialize", $data)));
   $lev_sql = $db->query("select distinct(l.staff_no) as staff_no,l.id,l.`status`,year(applied_date) as inyear from `leave_dump` l  where (l.status = 'HEAD-PENDING' or l.status = 'GRANTED' or l.status = 'HR-PENDING') and year(applied_date) >= year(NOW())-1 order by l.id desc");
   // $lev_sql = $db->query("select distinct(staff_no) as staff_no,id,`status`,year(applied_date) as inyear from leave_dump where year(applied_date) = year(now()) order by id desc");
   $rows = [];
   $levs = [];
   while ($lev = $lev_sql->fetch_array()) {
      $levs[] = $lev;
   }
   if (is_countable($data) && count($data) > 0) {
      foreach ($data as $row) {
         $row['onleave'] = $row['flag_leave_lock'] == 1 ? true : false;
         $row['status'] = '';
         $row['lid'] = 0;
         $row['inyear'] = date('Y');
         if (is_countable($levs) && count($levs) > 0) {
            foreach ($levs as $l) {
               if ($l['staff_no'] == $row['staff_no']) {
                  $row['status'] = $l['status'];
                  $row['lid'] = $l['id'];
                  $row['inyear'] = $l['inyear'];
               }
            }
            //$row['photo'] = isPhoto($row['photo']);
            $row['photo'] = 'https://cdn.ucc.edu.gh/photos/?tag=' . $row['staff_no'];
            $rows[] = $row;
         }
      }
   }
   // var_dump($rows);die();
   $app->render('mainlayout.php', [
      'page' => 'pages/head/leave.php',
      'slug' => 'unitleave',
      'data' => $rows
   ]);
})->name('unitleave');


// HEAD APPROVE LEAVE FORM
$app->get('/ajaxleaveapproveform', function () use ($app) {
   require_once './config/db.php';
   $lid = $app->request->get('lid');
   $st = $db->query("select l.*,p.unit_id,p.staff_group from leave_dump l left join staff s on l.staff_no = s.staff_no left join promotion p on s.promo_id = p.id where l.id = " . $lid)->fetch_assoc();
   $rl = $db->query("select s.*,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name from staff s left join promotion p on s.promo_id = p.id where p.unit_id = " . $st['unit_id']);
   $mems = [];
   while ($r = $rl->fetch_array()) {
      $mems[] = $r;
   }
   $app->render('pages/head/leaveform.php', [
      'members' => $mems,
      'data' => $st
   ]);
});
