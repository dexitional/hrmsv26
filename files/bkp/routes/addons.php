<?php 
if(!isset($_SESSION)){
  session_start();
}

// Curl Fetch Command
function fetch($url){
   $ch = curl_init();
   $headers = array(
     'Accept: application/json',
     'Content-Type: application/json',
   );
   curl_setopt($ch, CURLOPT_URL, $url);
   curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
   curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
   curl_setopt($ch, CURLOPT_SSL_VERIFYPEER , false);
   curl_setopt($ch, CURLOPT_TIMEOUT, 30);
   $data = curl_exec($ch);
   curl_close($ch);
   return $data;
};

// Authentication Checker
function authenticate() {
   if (!isset($_SESSION['user']) || $_SESSION['user'] == null) {
      $app = \Slim\Slim::getInstance();
      $app->flash('error', 'Login required');
      $app->redirect($app->urlFor('login'));
   }
}


/* Entry or Index Page */
$app->get('/', 'authenticate',function () use ($app) {
   // echo 'pa';
   // die();
   require_once './config/db.php';
   $staff = $_SESSION['user']['staff_no'];
   $rows = [];
   
   /** CIRCULARS FOR INTRO **/
   // Job Category Circulars
   $row_sql = $db->query("select *,date_format(created_at,'%M %d, %Y') as created_at from circular where find_in_set(".$_SESSION['user']['job_id'].",cat_job_id) > 0 and `status` > 0");
   if($row_sql->num_rows > 0){ while($row = $row_sql->fetch_array()){ $row['attachment'] = $_SESSION['settings']['assethost'].substr($row['attachment'],7); $row['copied'] = 'ALL '.$_SESSION['user']['jobtitle']; $rows['c'.$row['id']] = $row;}}
   // Unit Members Members Circulars
   $row_sql1 = "select *,date_format(created_at,'%M %d, %Y') as created_at from circular  where find_in_set(".$_SESSION['user']['unit_id'].",cat_unit_id) > 0 and cat_unit_status = 'ALL' and `status` > 0";
   // print_r($_SESSION['user']);
   // var_dump($_SESSION['user']['unit_id']);
   // echo $row_sql1;
   // die();
   $row_sql = $db->query($row_sql1);
   if($row_sql->num_rows > 0){ while($row = $row_sql->fetch_array()){ $row['attachment'] = $_SESSION['settings']['assethost'].substr($row['attachment'],7); $row['copied'] = 'MEMBERS, '.$_SESSION['user']['long_name']; $rows['c'.$row['id']] = $row;}}
   // Unit Heads Circulars
   $row_sql = $db->query("select c.*,date_format(c.created_at,'%M %d, %Y') as created_at from circular c left join unit u on find_in_set(u.id,cat_unit_id) > 0 where c.cat_unit_status = 'HOD' and `status` > 0 and (u.unit_head = '".$_SESSION['user']['staff_no']."' or u.unit_subhead  = '".$_SESSION['user']['staff_no']."')");
   if($row_sql->num_rows > 0){ while($row = $row_sql->fetch_array()){ $row['attachment'] = $_SESSION['settings']['assethost'].substr($row['attachment'],7); $row['copied'] = 'HEAD, '.$_SESSION['user']['long_name']; $rows['c'.$row['id']] = $row;}}
   // Staff Category Circulars
   $row_sql = $db->query("select *,date_format(created_at,'%M %d, %Y') as created_at from circular where find_in_set('".$_SESSION['user']['staff_group']."',cat_staff_group) > 0 and `status` > 0");
   if($row_sql->num_rows > 0){ while($row = $row_sql->fetch_array()){ $row['attachment'] = $_SESSION['settings']['assethost'].substr($row['attachment'],7); $row['copied'] = $_SESSION['user']['staff_group'] == 'SM' ? 'ALL SENIOR MEMBERS' : ($_SESSION['user']['staff_group'] == 'SS' ? 'ALL SENIOR STAFF' : 'ALL JUNIOR STAFF'); $rows['c'.$row['id']] = $row; }}
   // Staff Included Circulars
   $row_sql = $db->query("select *,date_format(created_at,'%M %d, %Y') as created_at from circular where find_in_set(".$_SESSION['user']['staff_no'].",cat_staff_no) > 0 and `status` > 0");
   if($row_sql->num_rows > 0){ while($row = $row_sql->fetch_array()){ $row['attachment'] = $_SESSION['settings']['assethost'].substr($row['attachment'],7); $row['copied'] = 'INCLUDED MEMBER'; $rows['c'.$row['id']] = $row; }}


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
$app->get('/profile', 'authenticate',function () use ($app) {
   $app->render('mainlayout.php',[
       'page' => 'pages/overview/profile.php',
       'slug' => 'profile'
   ]);
})->name('profile');

$app->get('/profile_report', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $bio_sql = $db->query("select s.staff_no as nox,s.*,DATE_FORMAT(dob,'%d/%m/%Y') as dobx,ifnull(TIMESTAMPDIFF(YEAR, dob, CURDATE()),0) AS age,b.*,upper(concat(sc.grade,', STEP ',sc.notch)) as grade,upper(j.title) as jobtitle, DATE_FORMAT(s.first_appoint_date,'%d/%m/%Y') as first_appoint,DATE_FORMAT(s.confirm_date,'%d/%m/%Y') as first_confirm,DATE_FORMAT(s.first_appoint_date,'%d/%m/%Y') as first_appoint,DATE_FORMAT(p.appoint_date,'%d/%m/%Y') as appoint_date from staff s left join bank b on b.id = s.bank_id left join promotion p on p.id = s.promo_id left join scale sc on sc.id = p.scale_id left join job j on p.job_id = j.id where s.staff_no = ".$user['staff_no']);
   $rel_sql = $db->query("select *,ifnull(DATE_FORMAT(dob,'%d/%m/%Y'),'NOT SET') as dobx,ifnull(TIMESTAMPDIFF(YEAR, dob, CURDATE()),0) AS age,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name from staff_rel where staff_no = ".$user['staff_no']);
   $cert_sql = $db->query("select * from certificate where staff_no = ".$user['staff_no']);
   $doc_sql = $db->query("select * from doc where `default` = 1 and staff_no = ".$user['staff_no']);
   $trans_sql = $db->query("select t.*,year(transfer_date) as year,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,date_format(transfer_date,'%D %M, %Y') as transdate,s.photo,x.long_name as tounit,f.long_name as fromunit,j.title as jobtitle,t.id,s.staff_no as nox from transfer t left join staff s on s.staff_no = t.staff_no left join unit x on x.id = t.to_unit left join unit f on f.id = t.from_unit left join promotion p on s.promo_id = p.id left join job j on p.job_id = j.id where t.staff_no = ".$user['staff_no']." and t.flag_delete = 0 order by transfer_date desc,id desc");
   $trans = []; $rel = []; $cert = []; $doc = [];$bio = [];
   if($bio_sql->num_rows > 0){
      $bio = $bio_sql->fetch_array();
      $bio['photo'] = isPhoto($bio['photo']);
      if($rel_sql->num_rows > 0){
         while($row = $rel_sql->fetch_assoc()){
            $rel[] = $row;
         }
      }
      if($cert_sql->num_rows > 0){
         while($row = $cert_sql->fetch_assoc()){
            $cert[] = $row;
         }
      }
      if($doc_sql->num_rows > 0){
         while($row = $doc_sql->fetch_assoc()){
            $doc[] = $row;
         }
      }
      if($trans_sql->num_rows > 0){
         while($row = $trans_sql->fetch_assoc()){
            $trans[] = $row;
         }
      }
      //var_dump($bio);exit;
      $app->render('reportlayout.php',[
         'page' => 'pages/overview/rep_profile.php',
         'slug' => 'profile',
         'bio' => $bio, 'rel' => $rel, 'cert' => $cert, 'doc' => $doc, 'trans' => $trans
      ]);
   }else{
      session_destroy();
      $app->flash('error', 'Wrong user credentials!');
      $app->redirect('login');
   }

});


// Notification Route
$app->get('/notification', 'authenticate',function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $sql = $db->query("select *,DATE_FORMAT(datetime,'%d/%m/%Y') as datetime from notification where staff_no = ".$user['staff_no']);
   $data = [];
   if($sql->num_rows > 0){
     while($row = $sql->fetch_assoc()){
       $data[] = $row;
     }
   }
   $app->render('mainlayout.php',[
       'page' => 'pages/overview/notification.php',
       'slug' => 'notification',
       'data' => $data
   ]);
});



/* EduRoam Routes */
$app->get('/eduroam', 'authenticate',function () use ($app) {
   $app->render('mainlayout.php',[
       'page' => 'pages/overview/eduroam.php',
       'slug' => 'eduroam'
   ]);
})->name('eduroam');


$app->get('/eduroam_user', function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $edu = $db->query("select password from `user` where staff_no = ".$user['staff_no'])->fetch_assoc();
   if(count($edu) > 0){
      $app->render('pages/overview/eduroam_user.php',[
         'slug' => 'eduroam',
         'email' => $user['ucc_mail'], 'password' => $edu['password']
      ]);
   }

});



/*  MAIN LEAV MODULE  */

// Leave Module
$app->get('/leavereq', 'authenticate',function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $host = $app->host; 
   //$cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.*,s.*,t.*,concat(r.lname,', ',r.fname,' ',r.mname,'<br>(',l.relieved_by,')') as relieve,concat(u.lname,', ',u.fname,' ',u.mname,'<br>(',l.head_endorse,')') as uhead,concat(h.lname,', ',h.fname,' ',h.mname,'<br>(',l.hr_endorse,')') as hhead from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id left join staff r on r.staff_no = l.relieved_by left join staff u on u.staff_no = l.head_endorse left join staff h on h.staff_no = l.hr_endorse left join promotion p on p.id = s.promo_id where year(applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']);
   $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']." order by l.id desc");
   $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = ".$user['staff_no']);
   $data = []; $flag = [];
   if($cur_sql->num_rows > 0){
      while($row = $cur_sql->fetch_assoc()){
         $data[] = $row;
      }
   }
   if($flag_sql->num_rows > 0){
      $flag = $flag_sql->fetch_assoc();
   }
      
   # Get Annual Leave Data from api
   
   $url = $host.'/getleavedata/'.$user['staff_no'].'/2';
   // var_dump($url);
   // die();
   $leave = json_decode(fetch($url),true);
   // echo $leave;
   // die();
   $app->render('mainlayout.php',[
       'page' => 'pages/leave/leavereq.php',
       'slug' => 'leavereq',
       'data' => $data,
       'leave' => $leave,
       'flag' => $flag
   ]);
})->name('leavereq');


// Leave Statistics Page
$app->get('/leavestat', function () use ($app) {
   $app->render('mainlayout.php',[
       'page' => 'pages/leave/leavestat.php',
       'slug' => 'leavestat'
   ]);
});


// Leave Statistics Report
$app->get('/leavestatrep', 'authenticate',function () use ($app) {
   require_once './config/db.php';
   $staff = $_SESSION['user']['staff_no'];
   $row_sql = $db->query("select l.id as lid,t.title,year(applied_date) as year,date_format(applied_date,'%a %b %d, %Y') as adate,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.*,s.*,t.*,concat(r.lname,', ',r.fname,' ',r.mname,' (',l.relieved_by,')') as relieve,concat(u.lname,', ',u.fname,' ',ifnull(u.mname,''),' (',l.head_endorse,')') as uhead,concat(h.lname,', ',h.fname,' ',h.mname,' (',l.hr_endorse,')') as hhead from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id left join staff r on r.staff_no = l.relieved_by left join staff u on u.staff_no = l.head_endorse left join staff h on h.staff_no = l.hr_endorse where l.staff_no = ".$staff." order by year(applied_date) desc,lid desc,t.title,l.status");
   $rows = [];
   if($row_sql->num_rows > 0){
      while($row = $row_sql->fetch_array()){ 
         $row['photo'] = isPhoto($row['photo']);
         $rows[] = $row;
      }
   }
   if(count($rows) > 0){
      $app->render('reportlayout.php',[
         'page' => 'pages/leave/rep_leavestat.php',
         'slug' => 'leavestat',
         'title' => 'LEAVE STATISTICS',
         'data' => $rows
      ]);
   }else{
      echo '<div style="width:100%;margin:0px auto 10px 80px;"><img src="../../public/images/zero.png"</div>';
   }
});



// Leave Form Report
$app->get('/leaveformrep/:sno', 'authenticate',function ($sno) use ($app) {
   require_once './config/db.php';
   $row_sql = $db->query("select l.id as lid,j.title as jobtitle, year(applied_date) as year,date_format(applied_date,'%a %b %d, %Y') as adate,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.*,s.*,t.*,l.emergency_contact,concat(r.lname,', ',r.fname,' ',r.mname,' (',l.relieved_by,')') as relieve,concat(u.lname,', ',u.fname,' ',ifnull(u.mname,''),' (',l.head_endorse,')') as uhead,concat(h.lname,', ',h.fname,' ',h.mname,' (',l.hr_endorse,')') as hhead from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join promotion p on p.id = s.promo_id left join job j on j.id  = p.job_id left join leave_type t on t.id = l.type_id left join staff r on r.staff_no = l.relieved_by left join staff u on u.staff_no = l.head_endorse left join staff h on h.staff_no = l.hr_endorse where l.id =".$sno);
   $row = null;
   if($row_sql->num_rows > 0){
      $row = $row_sql->fetch_assoc();
      $row['photo'] = isPhoto($row['photo']);
   }
   $app->render('reportlayout.php',[
       'page' => 'pages/leave/rep_leaveform.php',
       'slug' => 'leaveform',
       'title' => 'LEAVE FORM',
       'data' => $row
   ]);
});





// AJAX - Leave Form 
$app->get('/ajaxleaveform', 'authenticate',function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $host = $app->host; 
   $sno = $app->request->get('sno');
   $action = $app->request->get('action');
   
   if(!empty($sno) && !empty($action)){
      $st = $db->query("select concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,s.gender,s.staff_group,s.staff_no from staff s left join promotion p on s.promo_id = p.id where s.staff_no = ".$sno)->fetch_assoc();
      
      if($action == 'choose'){
         $leave_type_sql = $db->query("select * from leave_type where active = 1");
         if($leave_type_sql->num_rows > 0){
            $data = [];
            while($row = $leave_type_sql->fetch_array()){
               if($row['id'] == '3' && $st['gender'] == 'M'){continue;}
               $url = $host.'/getleavedata/'.$sno.'/'.$row['id'];
               $leave = json_decode(fetch($url),true);
               if($leave['canapply'] == false){continue;}
               $data[] = array('title' => $row['title'],'typeid' => $row['id'], 'sno' => $sno, 'data' => $leave, 'group' => $st['staff_group']);
            }
            $app->render('pages/leave/leaveform.php',[
               'action' => $action,
               'data' => $data,
               'st' => $st
            ]);
            //print_r($data);
         }

      }else if($action == 'applyform'){
         $data = [];
         $data['ent'] = !empty($app->request->get('ent')) ? $app->request->get('ent') : 0;
         $data['typeid'] = !empty($app->request->get('typeid')) ? $app->request->get('typeid') : 0;
         $data['title'] = !empty($app->request->get('title')) ? $app->request->get('title') : '';
         $data['group'] = !empty($app->request->get('group')) ? $app->request->get('group') : '';
         $data['sno'] = !empty($app->request->get('sno')) ? $app->request->get('sno') : '';
         $app->render('pages/leave/leaveform.php',[
            'action' => $action,
            'data' => $data,
            'st' => $st
         ]);
      }
   }else{
      # Return Instruction Page
   }
});



// Staff Delete Leave Requests
$app->get('/delleave/:id', 'authenticate',function ($id) use ($app) {
   require_once './config/db.php';
   $st = $db->query("select staff_no,status from leave_dump where id =".$id)->fetch_assoc();
   $db->query("update staff set flag_leave_lock = 0,flag_leave = 0 where staff_no = ".$st['staff_no']); // Lock Extra Leave Applications
   $db->query("delete from leave_dump where id = ".$id); 
   $app->redirect($app->urlFor('leavereq'));  
});

// Post Individual Leave Request
$app->post('/postleave', 'authenticate',function () use ($app){
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
   $dt = json_decode(fetch($_SESSION['settings']['apihost'].'/getleaveinfo?approved_days='.$appr.'&type='.$type.'&group='.$group.'&start_date='.$start),true);
   $start = $dt['start']; $end = $dt['end']; $resume = $dt['resume'];
   $sql = "insert into leave_dump(staff_no,approved_days,entitlement,type_id,emergency_note,emergency_contact,status,applied_date,start_date,end_date,resume_date) ";
   $sql .= " values (${sno},${appr},${ent},${type},'${emernote}','${emerphone}','${status}','${applied}','${start}','${end}','${resume}')";
   $run = $db->query($sql);
   if($run){
      $db->query("update staff set flag_leave_lock = 1 where staff_no = ".$sno); // Lock Extra Leave Applications
      $app->flash('success','Leave application successful!');
   }else{
      $app->flash('error','Leave application failed!');
   }
   $app->redirect($app->urlFor('leavereq'));  
});

$app->post('/staff_self_appraisal_update', 'authenticate',function () use ($app){
   require_once './config/db.php';
   $host = $app->host; 
   $r = $app->request();
   
      $staff_no = $_SESSION['user']['staff_no'];
      $unit_id = $_SESSION['user']['unit_id'];
      $sup_signed = trim($r->post('sup_signed'));
      $app_self_id = trim($r->post('app_self_id'));
      $app_status = '2';
      
   if(!empty($sup_signed)){
      $asess_as = $db->query("UPDATE staff_self_appraisal SET `sup_signed` = '${sup_signed}', app_status = '${app_status}'
			WHERE app_self_id = ${app_self_id}");
      if($asess_as){
         
         $data1 = [
            'status' => 'success',
            'message' => 'Appraisal have been updated successfully'
            ];
         echo json_encode($data1);
      }else{
         $data1 = [
            'status' => 'error',
            'message' => 'Error updating data'
            ];
         echo json_encode($data1);
      }
   }
  
});

$app->post('/assessor_assign', 'authenticate',function () use ($app){
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
      
   if(!empty($assessor1)){
      $asess_as = $db->query("UPDATE staff_promotion SET assessor1 = '${assessor1}', assessor2 = '${assessor2}', 
			assessor3 = '${assessor3}', assessor4 = '${assessor4}', assessor5 = '${assessor5}', assessor6 = '${assessor6}', stage_status = 3
			WHERE promotion_id = ${promotion_id}");
      if($asess_as){
         $sql1 = "INSERT INTO promo_activities(unit_id,user_id,promotion_id,stage_activity,comments,promo_status,activity)";
         $sql1 .= "VALUES (${unit_id},${staff_no},${promotion_id},'${stage_activity}','${comments}','${promo_status}','${activity}')";
         $getr = $db->query($sql1);
         
         $data1 = [
            'status' => 'success',
            'message' => 'Assessor has been assigned successfully'
            ];
         echo json_encode($data1);
      }else{
         $data1 = [
            'status' => 'error',
            'message' => 'Error uploading data'
            ];
         echo json_encode($data1);
      }
   }
  
});

// Head Endorse Leave
$app->post('/approveleave', 'authenticate',function () use ($app){
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
   $dt = json_decode(fetch($_SESSION['settings']['apihost'].'/getleaveinfo?approved_days='.$appr.'&type='.$type.'&group='.$group.'&start_date='.$start),true);
   $start = $dt['start']; $end = $dt['end']; $resume = $dt['resume'];
   $sql = "update leave_dump set approved_days = ${appr}, status = '${status}', head_date = '${head_date}', head_endorse = ${head_endorse}, start_date = '${start}', end_date = '${end}', resume_date = '${resume}' where id = ".$id;
   $run = $db->query($sql);
   if($run){
      $db->query("update staff set flag_leave_lock = 1,flag_leave = 2 where staff_no = ".$relieved_by); // Lock Extra Leave Applications for Reliever
      $app->flash('success','Leave application successful!');
   }else{
      $app->flash('error','Leave application failed!');
   } 
   $app->redirect($app->urlFor('unitleave'));  
 });


 // Calculate Leave Entitlement
 $app->get('/getleavedata/:staff/:type',function ($staff,$type) use ($app) { 
   require_once './config/db.php';
   $stud_ = $db->query("SELECT s.id,s.gender,s.staff_no,s.staff_status,p.staff_group,p.job_id,p.unit_id,j.type as staff_type FROM `staff` s left join promotion p on p.id = s.promo_id left join job j on j.id = p.job_id where s.staff_no = ".$staff); $stud = $stud_->fetch_array();     
   $type = (is_countable($stud) && count($stud) > 0 && $stud['staff_status'] == 'TEMPORAL') ? '1' : $type; // Check If Temporal Staff (Only Casual Leave Applies)
   $apply_ = $db->query("SELECT * FROM `leave_dump` where (staff_no = ".$staff." or relieved_by = ".$staff.") and (status = 'GRANTED' or status = 'STAFF-PENDING' or status = 'HEAD-PENDING' or status = 'HR-PENDING') and year(applied_date) ='".date('Y')."'"); $apply = $apply_->fetch_array();  // Can Staff Apply ( Not on Relieve Roles or Still on Previous Leave)
   if(is_countable($stud) && count($stud) > 0){  
       $approved_ = $db->query("SELECT ifnull(sum(approved_days),0) as ent FROM `leave_dump` where staff_no = ".$staff." and type_id = ".$type." and (status <> 'HR-REJECTED' and status <> 'HEAD-REJECTED' and status <> 'CANCELLED') and year(applied_date) ='".date('Y')."'"); $approved = $approved_->fetch_assoc();  
       $balance_ = $db->query("SELECT weight FROM `leave_balance` where staff_no = ".$staff." and active = '1'"); $balance = $balance_->fetch_assoc();  
       $con_add_ = $db->query("SELECT sum(weight) as weight FROM `leave_constant` where type='ADD' and category = '".$stud['staff_group']."' and active = '1' and year = '".date('Y')."' and (find_in_set('".$stud['staff_no']."',exclusion) <= 0 or exclusion IS NULL)"); $con_add = $con_add_->fetch_assoc();  
       $con_sub_ = $db->query("SELECT sum(weight) as weight FROM `leave_constant` where type='SUB' and category = '".$stud['staff_group']."' and active = '1' and year = '".date('Y')."' and (find_in_set('".$stud['staff_no']."',exclusion) <= 0 or exclusion IS NULL)");$con_sub =$con_sub_->fetch_assoc();  
       $defer_ = $db->query("SELECT * FROM `leave_defer` where staff_no = ".$staff." and `year` = '".date('Y')."'"); $defer = $defer_->fetch_assoc();  
       $weight;    
       switch($stud['staff_group']){
           case 'SS':
                   $k = $weight = $db->query("SELECT * FROM leave_weight where `group` = '".$stud['staff_group']."' and type_id = ".$type)->fetch_assoc();       
                    break;

           case 'JS':
                   $check_ = $db->query("SELECT * from `leave_weight` WHERE `group` = '".$stud['staff_group']."' and type_id = ".$type." and find_in_set('".$stud['job_id']."',jobs) > 0"); 
                   if($check_->num_rows > 0){
                      $weight = $check_->fetch_assoc();
                   }else{
                      $weight = $db->query("select * from `leave_weight` where `group` = '".$stud['staff_group']."' and type_id = ".$type." and jobs IS NULL")->fetch_assoc();
                   }  break;

           case 'SM':
                   $weight = ($stud['staff_type'] == 'NON-ACADEMIC') ? $db->query("SELECT * FROM leave_weight where `group` = '".$stud['staff_group']."' and type_id = ".$type)->fetch_assoc() : [array(weight => null)];  
                   break;
                   
           default : 
                   $weight = [array(weight=> null)];
                   break;
       }
       $ent;
       $sub = (is_countable($con_sub) && count($con_sub) > 0 ? $con_sub['weight'] : 0);
       $add = (is_countable($con_add) && count($con_add) > 0 ? $con_add['weight'] : 0);
       $used = (is_countable($approved) && count($approved) > 0 ? $approved['ent'] : 0); 
       $bal = (is_countable($balance) && count($balance) > 0 ? $balance['weight'] : 0);
       
       if($stud['gender'] == 'M' && $type == '3'){
           $ent = 0;
       }else{
           $ent = (is_countable($weight) && count($weight) > 0 ? $weight['weight'] : 0);
       } 
       $days = ($ent-$used+($type == '2' ? ($add+$bal-$sub): 0));
       $due = $days > 0 ? $days : 0;
       # Initialize Form
       if(is_countable($defer) && count($defer) > 0 && ($type == '2' || $type == '3' || $type == '1')){
           echo json_encode([
               'canapply' => false,   
               'deferred' > true,
               'entitlement' => 0,
               'balance' => 0,
               'deduction' => 0,
               'used' => 0,
               'due' => 0
           ]); 
       }else{
           echo json_encode([
               'canapply' => (is_countable($apply) && count($apply) > 0 ? false : true),
               'deferred' => false,
               'entitlement' => $ent,
               'balance' => $bal,
               'deduction' => ($type == '2' ? abs($add-$sub) : 0),
               'used' => $used,
               'due' => $due
           ]); 
       }
    }else{
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
$app->get('/promoreq', 'authenticate',function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $host = $app->host; 
   //$cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.*,s.*,t.*,concat(r.lname,', ',r.fname,' ',r.mname,'<br>(',l.relieved_by,')') as relieve,concat(u.lname,', ',u.fname,' ',u.mname,'<br>(',l.head_endorse,')') as uhead,concat(h.lname,', ',h.fname,' ',h.mname,'<br>(',l.hr_endorse,')') as hhead from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id left join staff r on r.staff_no = l.relieved_by left join staff u on u.staff_no = l.head_endorse left join staff h on h.staff_no = l.hr_endorse left join promotion p on p.id = s.promo_id where year(applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']);
   $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']." order by l.id desc");
   $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = ".$user['staff_no']);
   $data = []; $flag = [];
   if($cur_sql->num_rows > 0){
      while($row = $cur_sql->fetch_assoc()){
         $data[] = $row;
      }
   }
   if($flag_sql->num_rows > 0){
      $flag = $flag_sql->fetch_assoc();
   }
      
   # Get Annual Leave Data from api
   
   $url = $host.'/getleavedata/'.$user['staff_no'].'/2';
   $leave = json_decode(fetch($url),true);
   $app->render('mainlayout.php',[
       'page' => 'pages/promotion/promoreq.php',
       'slug' => 'leavereq',
       'data' => $data,
       'leave' => $leave,
       'flag' => $flag
   ]);
})->name('promoreq');

$app->get('/promotion_list', 'authenticate',function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $host = $app->host; 
   //$cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.*,s.*,t.*,concat(r.lname,', ',r.fname,' ',r.mname,'<br>(',l.relieved_by,')') as relieve,concat(u.lname,', ',u.fname,' ',u.mname,'<br>(',l.head_endorse,')') as uhead,concat(h.lname,', ',h.fname,' ',h.mname,'<br>(',l.hr_endorse,')') as hhead from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id left join staff r on r.staff_no = l.relieved_by left join staff u on u.staff_no = l.head_endorse left join staff h on h.staff_no = l.hr_endorse left join promotion p on p.id = s.promo_id where year(applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']);
   $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']." order by l.id desc");
   $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = ".$user['staff_no']);
   $data = []; $flag = [];
   if($cur_sql->num_rows > 0){
      while($row = $cur_sql->fetch_assoc()){
         $data[] = $row;
      }
   }
   if($flag_sql->num_rows > 0){
      $flag = $flag_sql->fetch_assoc();
   }
      
   # Get Annual Leave Data from api
   
   $url = $host.'/getleavedata/'.$user['staff_no'].'/2';
   $leave = json_decode(fetch($url),true);
   $app->render('mainlayout.php',[
       'page' => 'pages/promotion/staff_promo.php',
       'slug' => 'leavereq',
       'data' => $data,
       'leave' => $leave,
       'flag' => $flag
   ]);
})->name('promotion_list');


$app->get('/con_renewal', 'authenticate',function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $s_type = $_SESSION['user']['staff_type'];
   // var_dump($user);
   // die();
   $host = $app->host;
   $pos_sql = $db->query("SELECT * FROM hr.job WHERE type = '$s_type'");

   // $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']." order by l.id desc");
   // $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = ".$user['staff_no']);
   $data = [];
   if($pos_sql->num_rows > 0){
      while($row = $pos_sql->fetch_assoc()){
         $data[] = $row;
      }
   }
   $app->render('promolayout.php',[
       'page' => 'pages/promotion/contract_renewal.php',
       'slug' => 'con_renewal',
       'data' => $data
   ]);
})->name('con_renewal');


$app->get('/promo_apply', 'authenticate',function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $s_type = $_SESSION['user']['staff_type'];
   $host = $app->host;
   $pos_sql = $db->query("SELECT * FROM hr.job WHERE type = '$s_type'");

   // $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']." order by l.id desc");
   // $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = ".$user['staff_no']);
   $data = [];
   if($pos_sql->num_rows > 0){
      while($row = $pos_sql->fetch_assoc()){
         $data[] = $row;
      }
   }
   $app->render('promolayout.php',[
       'page' => 'pages/promotion/promo_apply.php',
       'slug' => 'promo_apply',
       'data' => $data
   ]);
})->name('promo_apply');

$app->get('/appraisal_hod', 'authenticate',function () use ($app) {
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
   if($pos_sql->num_rows > 0){
      while($row = $pos_sql->fetch_assoc()){
         $data[] = $row;
      }
   }
   $app->render('promolayout.php',[
       'page' => 'pages/appraisal/appraisal_hod.php',
       'slug' => 'appraisal_hod',
       'users' => $data
   ]);
})->name('appraisal_hod');

$app->get('/appraisalform/:sno', 'authenticate',function ($sno) use ($app) {
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
   if($row_sql->num_rows > 0){
      while($row = $row_sql->fetch_assoc()){
         $appstaff[] = $row;
      }
   }
   if($sql->num_rows > 0){
      while($row = $sql->fetch_assoc()){
         $appraisal_b_data[] = $row;
      }
   }
   if($sql1->num_rows > 0){
      while($row = $sql1->fetch_assoc()){
         $appraisal_b[] = $row;
      }
   }
   if($sql2->num_rows > 0){
      while($row = $sql2->fetch_assoc()){
         $users[] = $row;
      }
   }
   if($sql3->num_rows > 0){
      while($row = $sql3->fetch_assoc()){
         $userhead[] = $row;
      }
   }
   if($sql4->num_rows > 0){
      while($row = $sql4->fetch_assoc()){
         $getstdata[] = $row;
      }
   }
   $app->render('promolayout.php',[
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

$app->get('/promo_list', 'authenticate',function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $staff = $_SESSION['user']['staff_no'];
   $host = $app->host;
   $sqlp ="SELECT * FROM hr.staff_promotion AS t1 
   LEFT JOIN hr.staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
   LEFT JOIN hr.job AS t3 ON t1.`position_id` = t3.`id` WHERE t1.staff_no = $staff";
   $pos_sql = $db->query($sqlp);
   // var_dump($sqlp);
   // die();
   // $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']." order by l.id desc");
   // $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = ".$user['staff_no']);
   $data = [];
   if($pos_sql->num_rows > 0){
      while($row = $pos_sql->fetch_assoc()){
         $data[] = $row;
      }
   }
   $app->render('promolayout.php',[
       'page' => 'pages/promotion/promo_list.php',
       'slug' => 'promo_list',
       'data' => $data
   ]);
})->name('promo_list');

$app->get('/promo_listhod', 'authenticate',function () use ($app) {
   require_once './config/db.php';
   $user = $_SESSION['user'];
   $staff = $_SESSION['user']['staff_no'];
   $unit = $_SESSION['user']['unit_id'];
   // die();
   $host = $app->host;
   $pos_sql = $db->query("SELECT * FROM staff_promotion AS t1 LEFT JOIN staff AS t2 ON t1.`staff_no` = t2.`staff_no` 
   LEFT JOIN job AS t3 ON t1.`position_id` = t3.`id` 
   WHERE t1.unit_id = '$unit' ORDER BY t1.`promotion_id` ASC");

   // $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']." order by l.id desc");
   // $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = ".$user['staff_no']);
   $data = [];
   if($pos_sql->num_rows > 0){
      while($row = $pos_sql->fetch_assoc()){
         $data[] = $row;
      }
   }
   $app->render('promolayout.php',[
       'page' => 'pages/promotion/promo_listhod.php',
       'slug' => 'promo_listhod',
       'positions' => $data
   ]);
})->name('promo_listhod');

$app->get('/promo_listdd', 'authenticate',function () use ($app) {
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
   WHERE t4.faculty_id = '$unit' AND promo_status > 1 ORDER BY t1.`promotion_id` ASC");
   // var_dump($pos_sql);
   // die();

   // $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']." order by l.id desc");
   // $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = ".$user['staff_no']);
   $data = [];
   if($pos_sql->num_rows > 0){
      while($row = $pos_sql->fetch_assoc()){
         $data[] = $row;
      }
   }
   $app->render('promolayout.php',[
       'page' => 'pages/promotion/promo_listdd.php',
       'slug' => 'promo_listdd',
       'positions_dean' => $data
   ]);
})->name('promo_listdd');

$app->get('/promo_listpr', 'authenticate',function () use ($app) {
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
   WHERE t4.college_id = '5200' AND promo_status > 1 ORDER BY t1.`promotion_id` ASC");
// var_dump($pos_sql);
   // die();
   $asses = $db->query("SELECT * FROM `assessors` WHERE active = 0");

   // $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']." order by l.id desc");
   // $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = ".$user['staff_no']);
   $data = [];
   $data_as = [];
   if($pos_sql->num_rows > 0){
      while($row = $pos_sql->fetch_assoc()){
         $data[] = $row;
      }
   }
   if($asses->num_rows > 0){
      while($row = $asses->fetch_assoc()){
         $data_as[] = $row;
      }
   }
   $app->render('promolayout.php',[
       'page' => 'pages/promotion/promo_listpr.php',
       'slug' => 'promo_listpr',
       'positions' => $data,
       'assessor' => $data_as
   ]);
})->name('promo_listpr');


$app->get('/appraisal_a', 'authenticate',function () use ($app) {
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
   // $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']." order by l.id desc");
   // $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = ".$user['staff_no']);
   $data = [];
   $data_row = [];
   $st_data = [];
   if($pos_sql->num_rows > 0){
      while($row = $pos_sql->fetch_assoc()){
         $data[] = $row;
      }
   }
   if($uh->num_rows > 0){
      while($row = $uh->fetch_assoc()){
         $data_row[] = $row;
      }
   }
   if($st->num_rows > 0){
      while($row = $st->fetch_assoc()){
         $st_data[] = $row;
      }
   }
   $app->render('promolayout.php',[
       'page' => 'pages/appraisal/appraisal_a.php',
       'slug' => 'appraisal_a',
       'userhead' => $data_row,
       'staff' => $st_data,
       'appstaff' => $data
   ]);
})->name('appraisal_a');

$app->get('/appraisal_b', 'authenticate',function () use ($app) {
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

   // $cur_sql = $db->query("select l.id as lid,applied_date,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,l.status,s.fname,s.mname,s.lname,t.title,l.approved_days,l.entitlement,t.id as tid from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id where year(l.applied_date) = date_format(NOW(),'%Y') and s.staff_no = ".$user['staff_no']." order by l.id desc");
   // $flag_sql = $db->query("select flag_leave,flag_leave_lock from staff where staff_no = ".$user['staff_no']);
   $appraisal_b_data = [];
   $appraisal_b = [];
   $getstdata = [];
   $userhead = [];
   if($appraisal_b_filled->num_rows > 0){
      while($row = $appraisal_b_filled->fetch_assoc()){
         $appraisal_b_data[] = $row;
      }
   }
   if($appraisal_b1->num_rows > 0){
      while($row = $appraisal_b1->fetch_assoc()){
         $appraisal_b[] = $row;
      }
   }
   if($getstdata1->num_rows > 0){
      while($row = $getstdata1->fetch_assoc()){
         $getstdata[] = $row;
      }
   }
   if($getstaffApp->num_rows > 0){
      while($row = $getstaffApp->fetch_assoc()){
         $userhead[] = $row;
      }
   }
   $app->render('promolayout.php',[
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
   $app->render('mainlayout.php',[
       'page' => 'pages/promotion/promostat.php',
       'slug' => 'leavestat'
   ]);
});


// Promotion Statistics Report
$app->get('/promostatrep', 'authenticate',function () use ($app) {
   require_once './config/db.php';
   $staff = $_SESSION['user']['staff_no'];
   $row_sql = $db->query("select l.id as lid,t.title,year(applied_date) as year,date_format(applied_date,'%a %b %d, %Y') as adate,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.*,s.*,t.*,concat(r.lname,', ',r.fname,' ',r.mname,' (',l.relieved_by,')') as relieve,concat(u.lname,', ',u.fname,' ',ifnull(u.mname,''),' (',l.head_endorse,')') as uhead,concat(h.lname,', ',h.fname,' ',h.mname,' (',l.hr_endorse,')') as hhead from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id left join staff r on r.staff_no = l.relieved_by left join staff u on u.staff_no = l.head_endorse left join staff h on h.staff_no = l.hr_endorse where l.staff_no = ".$staff." order by year(applied_date) desc,lid desc,t.title,l.status");
   $rows = [];
   if($row_sql->num_rows > 0){
      while($row = $row_sql->fetch_array()){ 
         $row['photo'] = isPhoto($row['photo']);
         $rows[] = $row;
      }
   }
   if(count($rows) > 0){
      $app->render('reportlayout.php',[
         'page' => 'pages/leave/rep_leavestat.php',
         'slug' => 'leavestat',
         'title' => 'LEAVE STATISTICS',
         'data' => $rows
      ]);
   }else{
      echo '<div style="width:100%;margin:0px auto 10px 80px;"><img src="../../public/images/zero.png"</div>';
   }
});



// Leave Form Report
$app->get('/promoformrep/:sno', 'authenticate',function ($sno) use ($app) {
   require_once './config/db.php';
   $row_sql = $db->query("select l.id as lid,j.title as jobtitle, year(applied_date) as year,date_format(applied_date,'%a %b %d, %Y') as adate,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.*,s.*,t.*,l.emergency_contact,concat(r.lname,', ',r.fname,' ',r.mname,' (',l.relieved_by,')') as relieve,concat(u.lname,', ',u.fname,' ',ifnull(u.mname,''),' (',l.head_endorse,')') as uhead,concat(h.lname,', ',h.fname,' ',h.mname,' (',l.hr_endorse,')') as hhead from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join promotion p on p.id = s.promo_id left join job j on j.id  = p.job_id left join leave_type t on t.id = l.type_id left join staff r on r.staff_no = l.relieved_by left join staff u on u.staff_no = l.head_endorse left join staff h on h.staff_no = l.hr_endorse where l.id =".$sno);
   $rows = null;
   if($row_sql->num_rows > 0){
      $row = $row_sql->fetch_assoc();
      $row['photo'] = isPhoto($row['photo']);
   }
   $app->render('reportlayout.php',[
       'page' => 'pages/leave/rep_leaveform.php',
       'slug' => 'leaveform',
       'title' => 'LEAVE FORM',
       'data' => $row
   ]);
});


/* CIRCULAR MODULE */

// CIRCULARS POPULATED
$app->get('/circular', 'authenticate',function () use ($app) {
   require_once './config/db.php';
   $staff = $_SESSION['user']['staff_no'];
   $rows = [];
   // Job Category Circulars
   $row_sql = $db->query("select *,date_format(created_at,'%M %d, %Y') as created_at from circular where find_in_set(".$_SESSION['user']['job_id'].",cat_job_id) > 0 and `status` > 0");
   if($row_sql->num_rows > 0){ while($row = $row_sql->fetch_array()){ $row['attachment'] = $_SESSION['settings']['assethost'].substr($row['attachment'],7); $row['copied'] = 'ALL '.$_SESSION['user']['jobtitle']; $rows['c'.$row['id']] = $row;}}
   // Unit Members Members Circulars
   $row_sql = $db->query("select *,date_format(created_at,'%M %d, %Y') as created_at from circular  where find_in_set(".$_SESSION['user']['unit_id'].",cat_unit_id) > 0 and cat_unit_status = 'ALL' and `status` > 0");
   if($row_sql->num_rows > 0){ while($row = $row_sql->fetch_array()){ $row['attachment'] = $_SESSION['settings']['assethost'].substr($row['attachment'],7); $row['copied'] = 'MEMBERS, '.$_SESSION['user']['long_name']; $rows['c'.$row['id']] = $row;}}
   // Unit Heads Circulars
   $row_sql = $db->query("select c.*,date_format(c.created_at,'%M %d, %Y') as created_at from circular c left join unit u on find_in_set(u.id,cat_unit_id) > 0 where c.cat_unit_status = 'HOD' and (u.unit_head = '".$_SESSION['user']['staff_no']."' or u.unit_subhead  = '".$_SESSION['user']['staff_no']."') and `status` > 0");
   if($row_sql->num_rows > 0){ while($row = $row_sql->fetch_array()){ $row['attachment'] = $_SESSION['settings']['assethost'].substr($row['attachment'],7); $row['copied'] = 'HEAD, '.$_SESSION['user']['long_name']; $rows['c'.$row['id']] = $row;}}
   // Staff Category Circulars
   $row_sql = $db->query("select *,date_format(created_at,'%M %d, %Y') as created_at from circular where find_in_set('".$_SESSION['user']['staff_group']."',cat_staff_group) > 0 and `status` > 0");
   if($row_sql->num_rows > 0){ while($row = $row_sql->fetch_array()){ $row['attachment'] = $_SESSION['settings']['assethost'].substr($row['attachment'],7); $row['copied'] = $_SESSION['user']['staff_group'] == 'SM' ? 'ALL SENIOR MEMBERS' : ($_SESSION['user']['staff_group'] == 'SS' ? 'ALL SENIOR STAFF' : 'ALL JUNIOR STAFF'); $rows['c'.$row['id']] = $row; }}
   // Staff Included Circulars
   $row_sql = $db->query("select *,date_format(created_at,'%M %d, %Y') as created_at from circular where find_in_set(".$_SESSION['user']['staff_no'].",cat_staff_no) > 0 and `status` > 0");
   if($row_sql->num_rows > 0){ while($row = $row_sql->fetch_array()){ $row['attachment'] = $_SESSION['settings']['assethost'].substr($row['attachment'],7); $row['copied'] = 'INCLUDED MEMBER'; $rows['c'.$row['id']] = $row; }}
   
   $rows = array_values($rows);
   $rows = array_map("unserialize", array_unique(array_map("serialize", $rows)));
   $id = array_column($rows, 'id');
   array_multisort($id, SORT_DESC, $rows);
   $app->render('mainlayout.php',[
       'page' => 'pages/circular/notice.php',
       'slug' => 'circular',
       'data' => $rows
   ]);
})->name('circular');



// CLOSE CIRCULAR INTRO MODAL
$app->get('/intro_close', 'authenticate',function () use ($app) {
   $_SESSION['user']['circulars'] = null;
   unset($_SESSION['user']['circulars']);
   $app->redirect($app->urlFor('circular'));
})->name('intro_close');



/*  HEAD OF UNIT MODULE  */

// UNIT MEMBERS
$app->get('/members', 'authenticate',function () use ($app) {
   require_once './config/db.php';
   $staff = $_SESSION['user']['staff_no'];
   $row_sql = $db->query("select s.staff_no as nox,s.*,DATE_FORMAT(dob,'%d/%m/%Y') as dobx,b.*,u.long_name,sc.notch,sc.grade as title,j.title as jobtitle from staff s left join bank b on b.id = s.bank_id left join promotion p on p.id = s.promo_id left join scale sc on sc.id = p.scale_id left join unit u on p.unit_id = u.id left join job j on p.job_id = j.id where (u.unit_head = ".$staff." or u.unit_subhead = ".$staff.") and s.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE')");
   $rows = [];
   if($row_sql->num_rows > 0){
      while($row = $row_sql->fetch_array()){
          $row['photo'] = isPhoto($row['photo']);
          $rows[] = $row;
      }
   }
   $app->render('mainlayout.php',[
       'page' => 'pages/head/member.php',
       'slug' => 'members',
       'data' => $rows
   ]);
})->name('members');


// UNIT MEMBERS
$app->get('/memlist/:unit', 'authenticate',function ($unit) use ($app) {
   require_once './config/db.php';
   $staff = $_SESSION['user']['staff_no'];
   $unit = strtolower(urldecode($unit));
   $row_sql = $db->query("select distinct s.staff_no,u.*,s.photo,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname) as name,s.phone,s.ucc_mail,j.title from staff s left join promotion p on s.promo_id = p.id left join unit u  on p.unit_id = u.id left join job j on j.id = p.job_id where s.staff_status in ('TEMPORAL','PERMANENT') and lower(u.long_name) = '".$unit."' order by s.staff_no");
   $rows = [];
   if($row_sql->num_rows > 0){
      while($row = $row_sql->fetch_array()){ $rows[] = $row;}
      //var_dump($rows);exit;
   }
   //var_dump($rows);exit;
   $app->render('pages/head/memlist.php',['rows' => $rows]);
})->name('memlist');



// UNIT LEAVE
$app->get('/unitleave', 'authenticate',function () use ($app) {
   require_once './config/db.php';
   $staff = $_SESSION['user']['staff_no'];
   // New rules
   $data = [];$excludes = [];$assigned = [];
   /* Includers */
   $unit1_sql = $db->query("select distinct s.staff_no as nox,s.staff_no,p.unit_id,p.job_id,s.flag_leave_lock,s.photo,s.fname,s.mname,s.lname,s.phone,s.ucc_mail,s.flag_leave,u.long_name,u.unit_head,u.unit_subhead,j.title as jobtitle from staff s left join promotion p on p.id = s.promo_id left join unit u on p.unit_id = u.id left join job j on p.job_id = j.id where (u.unit_head = ".$staff." or u.unit_subhead = ".$staff.") and s.staff_no <> ".$staff." and j.type = 'NON-ACADEMIC' and s.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE')");
   $unit2_sql = $db->query("select s.staff_no as nox,s.staff_no,p.unit_id,p.job_id,s.flag_leave_lock,s.photo,s.fname,s.mname,s.lname,s.phone,s.ucc_mail,s.flag_leave,u.long_name,u.unit_head,u.unit_subhead,j.title as jobtitle from leave_approver l left join promotion p on find_in_set(p.unit_id,l.value) > 0 left join staff s on p.id = s.promo_id left join job j on j.id = p.job_id left join unit u on p.unit_id = u.id where l.field = 'unit_id' and j.type = 'NON-ACADEMIC' and s.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE') and l.approver = ".$staff." and s.staff_no <> ".$staff." and s.staff_no is not null");
   $job_sql = $db->query("select s.staff_no as nox,s.staff_no,p.unit_id,p.job_id,s.flag_leave_lock,s.photo,s.fname,s.mname,s.lname,s.phone,s.ucc_mail,s.flag_leave,u.long_name,u.unit_head,u.unit_subhead,j.title as jobtitle from leave_approver l left join promotion p on find_in_set(p.job_id,l.value) > 0 left join staff s on p.id = s.promo_id left join job j on j.id = p.job_id left join unit u on p.unit_id = u.id where l.field = 'job_id' and j.type = 'NON-ACADEMIC' and s.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE') and l.approver = ".$staff." and s.staff_no <> ".$staff." and s.staff_no is not null");
   $sno_sql = $db->query("select s.staff_no as nox,s.staff_no,p.unit_id,p.job_id,s.flag_leave_lock,s.photo,s.fname,s.mname,s.lname,s.phone,s.ucc_mail,s.flag_leave,u.long_name,u.unit_head,u.unit_subhead,j.title as jobtitle from leave_approver l left join staff s on l.value = s.staff_no left join promotion p on p.id = s.promo_id left join job j on j.id = p.job_id left join unit u on p.unit_id = u.id where l.field = 'staff_no' and j.type = 'NON-ACADEMIC' and s.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE') and l.approver = ".$staff." and s.staff_no <> ".$staff." and s.staff_no is not null");
   if($unit1_sql->num_rows > 0){ while($row = $unit1_sql->fetch_array()){ $data[] = $row;}}
   if($unit2_sql->num_rows > 0){ while($row = $unit2_sql->fetch_array()){ $data[] = $row;}}
   if($job_sql->num_rows > 0){ while($row = $job_sql->fetch_array()){ $data[] = $row;}}
   if($sno_sql->num_rows > 0){ while($row = $sno_sql->fetch_array()){ $data[] = $row;}}
   /* Excluders - Assigned to different approvers */
   $unite_sql = $db->query("select s.staff_no,p.unit_id,p.job_id from leave_approver l left join promotion p on find_in_set(p.unit_id,l.value) > 0 left join staff s on p.id = s.promo_id left join job j on j.id = p.job_id where l.field = 'unit_id' and j.type = 'NON-ACADEMIC' and s.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE') and l.approver <> ".$staff." and s.staff_no is not null");
   $jobe_sql = $db->query("select s.staff_no,p.unit_id,p.job_id from leave_approver l left join promotion p on find_in_set(p.job_id,l.value) > 0 left join staff s on p.id = s.promo_id left join job j on j.id = p.job_id where l.field = 'job_id' and j.type = 'NON-ACADEMIC' and s.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE') and l.approver <> ".$staff." and s.staff_no is not null");
   $snoe_sql = $db->query("select s.staff_no,p.unit_id,p.job_id from leave_approver l left join staff s on l.value = s.staff_no left join promotion p on p.id = s.promo_id left join job j on j.id = p.job_id where l.field = 'staff_no' and j.type = 'NON-ACADEMIC' and s.staff_status not in ('RETIRED','DISMISSED','RESIGNED','DEAD','ABSENCE') and l.approver <> ".$staff." and s.staff_no is not null");
   if($unite_sql->num_rows > 0){ while($row = $unite_sql->fetch_array()){ $excludes[] = $row;}}
   if($jobe_sql->num_rows > 0){ while($row = $jobe_sql->fetch_array()){ $excludes[] = $row;}}
   if($snoe_sql->num_rows > 0){ while($row = $snoe_sql->fetch_array()){ $excludes[] = $row;}}
   if(is_countable($excludes) && count($excludes) > 0){
      foreach($excludes as $row){
         array_filter($data, function($item) use($row){
            return $item['staff_no'] != $row['staff_no'];
         });
      }
   }
   $data = array_map("unserialize", array_unique(array_map("serialize", $data)));
   $lev_sql = $db->query("select distinct(l.staff_no) as staff_no,l.id,l.`status`,year(applied_date) as inyear from `leave_dump` l  where (l.status = 'HEAD-PENDING' or l.status = 'GRANTED' or l.status = 'HR-PENDING') and year(applied_date) >= year(NOW())-1 order by l.id desc");
   $rows = []; $levs = [];
   while($lev = $lev_sql->fetch_array()){ $levs[] = $lev;}
   if(is_countable($data) && count($data) > 0){
      foreach($data as $row){
         $row['onleave'] = $row['flag_leave_lock'] == 1 ? true : false;  $row['status'] = ''; $row['lid'] = 0; $row['inyear'] = date('Y');   
         if(is_countable($levs) && count($levs) > 0){
            foreach($levs as $l){
              if($l['staff_no'] == $row['staff_no']){
                 $row['status'] = $l['status']; $row['lid'] = $l['id']; $row['inyear'] = $l['inyear'];
              }
            } 
            $row['photo'] = isPhoto($row['photo']);
            $rows[] = $row;
         }
      }
   }
   $app->render('mainlayout.php',[
       'page' => 'pages/head/leave.php',
       'slug' => 'unitleave',
       'data' => $rows
   ]);
})->name('unitleave');


// HEAD APPROVE LEAVE FORM
$app->get('/ajaxleaveapproveform', function () use ($app) {
   require_once './config/db.php';
   $lid = $app->request->get('lid');
   $st = $db->query("select l.*,p.unit_id,p.staff_group from leave_dump l left join staff s on l.staff_no = s.staff_no left join promotion p on s.promo_id = p.id where l.id = ".$lid)->fetch_assoc();
   $rl = $db->query("select s.*,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name from staff s left join promotion p on s.promo_id = p.id where p.unit_id = ".$st['unit_id']);
   $mems = []; 
   while($r = $rl->fetch_array()){ 
      $mems[] = $r;
   }
   $app->render('pages/head/leaveform.php',[
      'members' => $mems,
      'data' => $st
   ]);
});
                    

