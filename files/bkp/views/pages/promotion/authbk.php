<?php
if (!isset($_SESSION)) {
    session_start();
}

// Google Config & Initialization
//$app->redirectUrl = 'http://localhost/sportal/sauth';
$app->redirectUrl = 'https://staffportal.ucc.edu.gh/sauth';
$app->client = new Google_Client();
$app->client->setAuthConfig('./config/google_token.json');
$app->client->addScope('https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email');
$app->client->setRedirectUri($app->redirectUrl);
$app->client->setAccessType('offline');
$app->client->setHostedDomain('ucc.edu.gh');
$app->client->setPrompt('select_account');


// Curl Fetch Command
function apipost($url, $form)
{
    try {
        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $form);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        $response = curl_exec($curl);
        curl_close($curl);
        return $response;
    } catch (Exception $e) {
        throw $e;
    }
};


/* Login Page */
$app->get('/login', function () use ($app) {
    $app->render('pages/auth/login.php', ['app' => $app]);
})->name('login');

$app->get('/logout', function () use ($app) {
    unset($_SESSION['user']);
    unset($_SESSION['access_token']);
    $_SESSION['user'] = null;
    $_SESSION['access_token'] = null;
    $app->redirect($app->urlFor('login'));
})->name('logout');


$app->post('/postlogin1', function () use ($app) {

    require './config/db.php';
    $r = $app->request();
    // var_dump($r);die();
    $username = trim($r->post('username'));
    $password = trim($r->post('password'));
    if ($username == '' || $password == '') {
        // echo 'pasw';
        // die();
        $app->flash('error', 'Please enter staff number or password!');
        $app->redirect($app->urlFor('login'));
    } else {
        // echo $db ? 'con' : 'not'; die();
        $res1 = $db->query("SELECT * FROM hr.`user` AS t1 
      LEFT JOIN hr.`staff` AS t2 ON t1.`username` = t2.`staff_no`
      LEFT JOIN hr.`unit` AS t3 ON t2.`unit_id` = t3.`id`
      WHERE t1.`username` = '$username'");
        $row = $res1->fetch_array();
        // var_dump($row);
        if ($row) {
            $hashedPassword = $row['password'];
        }
        // echo password_hash('123456', PASSWORD_DEFAULT);
        // die();
        if ($row && password_verify($password, $hashedPassword)) {
            $sno = $row['staff_no'];
            $res = $db->query("select u.*,s.*,x.*,
             s.unit_id,p.scale_id,s.job_id,s.staff_group,j.type as staff_type,j.title as jobtitle,r.desc as privilege 
             from user u 
             left join staff s on u.staff_no = s.staff_no 
             left join user_roles r on r.role = u.role 
             left join promotion p on p.id = s.promo_id 
             left join job j on s.job_id = j.id 
             left join unit x on s.unit_id = x.id
             where s.staff_no = $sno and u.active = '1'");
            //  var_dump($res);
            //  echo '<br>';
            //  echo $res->num_rows;
            //  die();
            if ($res->num_rows > 0) {
                $row = $res->fetch_array();
                $hasAsset = false;

                $sno = $row['staff_no'];
                $uhead = $db->query("select t1.level, t1.type from hr.unit as t1
left join staff as t2 on t2.staff_no = t1.unit_head or t2.staff_no = t1.unit_subhead
left join job as t3 on t2.job_id = t3.id
where t2.staff_no = " . $sno);
                $unithd = $uhead->fetch_array();
                if (!empty($unithd)) {
                    $_SESSION['uhead'] = $unithd['level'];
                    $_SESSION['headtype'] = $unithd['type'];
                }

                $as = "select staff_id from asset_db2.staff_accommodation where staff_id <> 0 and staff_id = " . $row['staff_no'];
                $exe = $db->query($as);
                //  echo $as;
                //var_dump($exe);
                //die();
                if ($exe->num_rows > 0) {
                    $row['hasAsset'] = true;
                } else {
                    $row['hasAsset'] = $hasAsset;
                }
                $roles = explode(',', $row['roles']);
                if (is_countable($roles) && count($roles) > 0) {
                    foreach ($roles as $r) {
                        if ($r == '03' || $r == '04') {
                            $row['role'] = $r;
                            break;
                        }
                    }
                }
                // If Staff is Sub-head (award head privileges)
                $row['issubhead'] = (!is_null($row['unit_subhead']) && $row['unit_subhead'] == $row['staff_no']) ? true : false;
                if ($row['issubhead']) $row['role'] = '04';
                // Check Photo Existence
                $row['photo'] = 'https://cdn.ucc.edu.gh/photos/?tag=' . $row['staff_no'];
                // Initialise Session
                //  var_dump($row);
                //  die();
                $_SESSION['user'] = $row;
                $staff = $row['staff_no'];

                $pos_sql = $db->query("SELECT * from procurement.comments as t1 
                    left join hr.unit as t2 on t1.unit_to = t2.id
                    left join hr.staff as t3 on t2.unit_head = t3.staff_no or t3.staff_no = t2.unit_subhead
                    where t1.status = 0 and t2.unit_head = '$staff' or t2.unit_subhead = '$staff'");


                $data = [];
                if ($pos_sql->num_rows > 0) {
                    while ($row1 = $pos_sql->fetch_assoc()) {
                        $data[] = $row1;
                    }
                }
                $_SESSION['procureset'] = $data;
                //  if($app->urlFor('index')){
                //     echo 'dda';
                //     die();
                //  }else{
                //     echo 'dww';
                //     die();
                //  }
                // var_dump($row); die();
                $staff = $row['staff_no'];

                $upro_sql3 = $db->query("SELECT * from academic_advisers 
                    where staff_no = '$staff' and approved = 0 and stage_status = 0 and status = 1");

                if ($upro_sql3) {
                    $data1 = [];
                    if ($upro_sql3->num_rows > 0) {
                        while ($row1 = $upro_sql3->fetch_assoc()) {
                            $data1[] = $row1;
                        }
                        $progid = $data1[0]['progid'];
                        $level_ass = $data1[0]['level_ass'];
                    }
                    // var_dump($data1);die();
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

                $pos_sql = $db->query("SELECT * from procurement.comments as t1 
                    left join hr.unit as t2 on t1.unit_to = t2.id
                    left join hr.staff as t3 on t2.unit_head = t3.staff_no or t3.staff_no = t2.unit_subhead
                    where t1.status = 0 and t2.unit_head = '$staff' or t2.unit_subhead = '$staff'");


                $data = [];
                if ($pos_sql->num_rows > 0) {
                    while ($row1 = $pos_sql->fetch_assoc()) {
                        $data[] = $row1;
                    }
                }
                $_SESSION['procureset'] = $data;


                $app->redirect($app->urlFor('index'));
            } else {
                //  echo 'adw';die();
                $app->flash('error', 'Wrong user credentials!');
                $app->redirect($app->urlFor('login'));
            }
        } else {
            // echo 'al'; die();
            $app->flash('error', 'Wrong user credentials!');
            $app->redirect($app->urlFor('login'));
        }
    }
})->name('postlogin1');

/* Local Provider */
$app->post('/postlogin', function () use ($app) {
    require './config/db.php';
    $r = $app->request();
    $username = trim($r->post('username'));
    $password = trim($r->post('password'));
    if ($username == '' || $password == '') {
        $app->flash('error', 'Please enter staff number or password!');
        $app->redirect($app->urlFor('login'));
    } else {
        $url = 'https://oauth.ucc.edu.gh/api/v1/login';
        $form = ['email' => $username, 'password' => $password];
        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($form));
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        //curl_setopt($curl, CURLOPT_SSL_VERIFYPEER , false);
        //curl_setopt($curl, CURLOPT_VERBOSE, 1);

        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        /*curl_setopt($curl, CURLOPT_HTTPHEADER, array(
      'Content-Type: application/json',
      'Content-Length: ' . strlen(json_encode($form)))
     );*/
        //$status = curl_getinfo($curl);
        //echo json_encode($status, JSON_PRETTY_PRINT);exit;
        $response = curl_exec($curl);
        $resp = json_decode($response, true);
        if ($response && $resp['success']) {
            $sno = $resp['data']['staff_no'];
            $res = $db->query("select u.*,s.*,x.*,
            s.unit_id,p.scale_id,s.job_id,s.staff_group,j.type as staff_type,j.title as jobtitle,r.desc as privilege 
            from user u 
            left join staff s on u.staff_no = s.staff_no 
            left join user_roles r on r.role = u.role 
            left join promotion p on p.id = s.promo_id 
            left join job j on s.job_id = j.id 
            left join unit x on s.unit_id = x.id
            where s.staff_no = $sno and u.active = '1'");
            if ($res->num_rows > 0) {
                $row = $res->fetch_array();
                $hasAsset = false;

                $sno = $row['staff_no'];
                $uhead = $db->query("select t1.level, t1.type from hr.unit as t1
left join staff as t2 on t2.staff_no = t1.unit_head or t2.staff_no = t1.unit_subhead
left join job as t3 on t2.job_id = t3.id
where t2.staff_no = " . $sno);
                $unithd = $uhead->fetch_array();
                if (!empty($unithd)) {
                    $_SESSION['uhead'] = $unithd['level'];
                    $_SESSION['headtype'] = $unithd['type'];
                }
                $staff = $row['staff_no'];
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

                $pos_sql = $db->query("SELECT * from procurement.comments as t1 
                    left join hr.unit as t2 on t1.unit_to = t2.id
                    left join hr.staff as t3 on t2.unit_head = t3.staff_no or t3.staff_no = t2.unit_subhead
                    where t1.status = 0 and t2.unit_head = '$staff' or t2.unit_subhead = '$staff'");


                $data = [];
                if ($pos_sql->num_rows > 0) {
                    while ($row1 = $pos_sql->fetch_assoc()) {
                        $data[] = $row1;
                    }
                }
                $_SESSION['procureset'] = $data;

                $as = $db->query("select staff_id from asset_db2.staff_accommodation where staff_id <> 0 and staff_id = " . $row['staff_no']);
                if ($as->num_rows > 0) {
                    $row['hasAsset'] = true;
                } else {
                    $row['hasAsset'] = $hasAsset;
                }
                $roles = explode(',', $row['roles']);
                if (is_countable($roles) && count($roles) > 0) {
                    foreach ($roles as $r) {
                        if ($r == '03' || $r == '04') {
                            $row['role'] = $r;
                            break;
                        }
                    }
                }
                // If Staff is Sub-head (award head privileges)
                $row['issubhead'] = (!is_null($row['unit_subhead']) && $row['unit_subhead'] == $row['staff_no']) ? true : false;
                if ($row['issubhead']) $row['role'] = '04';
                // Check Photo Existence
                //$row['photo'] = isPhoto($row['photo']);
                $row['photo'] = 'https://cdn.ucc.edu.gh/photos/?tag=' . $row['staff_no'];

                // Initialise Session
                $_SESSION['user'] = $row;
                $app->redirect($app->urlFor('index'));
            } else {
                $app->flash('error', 'Wrong user credentials!');
                $app->redirect($app->urlFor('login'));
            }
        } else {
            $app->flash('error', $resp['msg']);
            $app->redirect($app->urlFor('login'));
        }
    }
})->name('postlogin');


$app->post('/tndmodal_status', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    $file_type = ['image/jpg', 'image/png', 'image/jpeg', 'application/pdf'];
    $r = $app->request();
    $promo_id = $r->post('promo_id');
    $promo = explode(',', $promo_id);
    echo $pid = $promo[0];
    // $stagen = $promo[1];
    $data0 = $db->query("SELECT *
   FROM tndstudy_activities AS t1 
   LEFT JOIN study_intention AS t2 ON t1.studyform_id = t2.id 
   WHERE t1.studyform_id = $pid");
    $data1 = $db->query("SELECT * FROM study_intention WHERE id = $pid");
    $data8 = $db->query("SELECT *
   FROM tndstudy_activities AS t1 
   LEFT JOIN study_intention AS t2 ON t1.studyform_id = t2.id 
   WHERE t1.studyform_id = $pid");

    $ps0 = [];
    $ps1 = [];
    $ps8 = [];
    if (!empty($data8)) {
        while ($row = $data8->fetch_assoc()) {
            $ps8[] = $row;
        }
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

    // var_dump($ps5);
    // die();
?>
    <div class="modal fade right tndstatus_modal" id="tndstatus_modal" tabindex="-1" role="dialog" style="width:50%; height:100%;" aria-labelledby="myModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable modal-notify modal-success modal-side modal-top-right" role="document">
            <div class="modal-content" style="border-radius: 10px 10px;">
                <div class="modal-header bg-primary" style="height:70px;">
                    <h4 class="text-white" style="margin-top:-10px;">Application Stages
                    </h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" onclick="closeModal1()">
                        <span aria-hidden="true" class="text-white btn-sm btn-danger">Close</span>
                    </button>
                </div>
                <div class="modal-body bg-light">
                    <div class="body">
                        <div role="tabpanel" class="tab-pane" id="timeline">
                            <ul class="cbp_tmtimeline">
                                <?php if (!empty($data1)) {
                                    while ($row = $data1->fetch_assoc()) {
                                        $ps1[] = $row;
                                    }
                                    foreach ($ps1 as $s_data) {
                                ?>
                                        <li>
                                            <time class="cbp_tmtime"><span class="hidden"><?php echo $s_data['activity_date']; ?></span></time>
                                            <div class="cbp_tmicon"><i class="zmdi zmdi-account"></i></div>
                                            <div class="cbp_tmlabel">
                                                <h2><a href="javascript:void(0);">
                                                        APPLICANT
                                                    </a></h2>
                                                <h5>Intention to Study</h5>
                                                <p>Applied for Declaration of Intention to pursue further studies</p>
                                            </div>
                                        </li>
                                <?php }
                                } ?>
                                <?php if (!empty($data0)) {
                                    while ($row = $data0->fetch_assoc()) {
                                        $ps0[] = $row;
                                    }
                                    foreach ($ps0 as $r_data) {
                                ?>
                                        <li>
                                            <time class="cbp_tmtime"><span class="hidden"><?php echo $r_data['activity_date']; ?></span></time>
                                            <?php if ($r_data['activity'] == 1) { ?>
                                                <div class="cbp_tmicon bg-success"><i class="zmdi zmdi-thumb-up"></i></div>
                                            <?php } elseif ($r_data['activity'] == 2) { ?>
                                                <div class="cbp_tmicon bg-danger"><i class="zmdi zmdi-thumb-down"></i></div>
                                            <?php } else { ?>
                                                <div class="cbp_tmicon"><i class="zmdi zmdi-account"></i></div>
                                            <?php } ?>
                                            <div class="cbp_tmlabel">
                                                <h2><a href="javascript:void(0);">
                                                        <?php if ($r_data['promo_status'] == 2) {
                                                            echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'HOD' : 'HOD';
                                                        } elseif ($r_data['promo_status'] == 3) {
                                                            echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'DIRECTOR' : 'DEAN';
                                                        } elseif ($r_data['promo_status'] == 4) {
                                                            echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'DIRECTOR' : 'PROVOST';
                                                        } elseif ($r_data['promo_status'] > 4) {
                                                            echo 'HR';
                                                        } else {
                                                            echo 'APPLICANT';
                                                        }; ?>

                                                    </a></h2>
                                                <h5><?php echo $r_data['activity'] == 1 ? 'Approved' : 'Disapproved'; ?></h5>
                                                <p><?php echo $r_data['comments']; ?></p>
                                            </div>
                                        </li>
                                <?php }
                                } ?>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <script>
        function closeModal() {
            jQuery('#status_modal').modal('hide');
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        }

        $('#status_modal').on('hidden.bs.modal', function() {
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        });

        function closeModal() {
            jQuery('#status_modal').modal('hide');
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        }

        $('#status_modal').on('hidden.bs.modal', function() {
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        });
    </script>

<?php

});

$app->post('/modal_status', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    $file_type = ['image/jpg', 'image/png', 'image/jpeg', 'application/pdf'];
    $r = $app->request();
    $promo_id = $r->post('promo_id');
    $promo = explode(',', $promo_id);
    $pid = $promo[0];
    $stagen = $promo[1];
    $data0 = $db->query("SELECT t1.promo_status as act_promo_status, t1.returned as act_returned, t1.type as act_type,
   t1.activity_date as act_activity_date, t1.comments as act_comments, t1.activity, t1.stage_file,
   t1.stage_activity, t1.updatedpapers, t1.updatedcv, t1.updatedform, t2.promo_doc1, t2.promo_doc2, t2.apply_form, t2.stage, t2.assessor1,
   t2.assessor2,t2.assessor3, t2.assessor4, t2.assessor5, t2.assessor6, t2.promo_status, t2.stage_status,
   t2.activity_date,t2.type, t2.returned, t2.promo_comments
   FROM promo_activities AS t1 
   LEFT JOIN staff_promotion AS t2 ON t1.promotion_id = t2.promotion_id 
   WHERE t1.promotion_id = $pid and t1.comments not like '%Submitted files for promotion%'");
    $data1 = $db->query("SELECT * FROM promo_activities WHERE promotion_id = $pid AND promo_status= 1 and activity = 0 limit 1");
    $data8 = $db->query("SELECT * FROM promo_activities AS t1 
   LEFT JOIN staff_promotion AS t2 ON t1.promotion_id = t2.promotion_id 
   WHERE t1.promotion_id = $pid");

    $ps0 = [];
    $ps1 = [];
    $ps8 = [];
    if (!empty($data8)) {
        while ($row = $data8->fetch_assoc()) {
            $ps8[] = $row;
        }
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

    //var_dump($ps0);
    // die();
?>
    <div class="modal fade right status_modal" id="status_modal" tabindex="-1" role="dialog" style="width:50%; height:100%;" aria-labelledby="myModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable modal-notify modal-success modal-side modal-top-right" role="document">
            <div class="modal-content" style="border-radius: 10px 10px;">
                <div class="modal-header bg-primary" style="height:70px;">
                    <h4 class="text-white" style="margin-top:-10px;">Application Stages
                    </h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" onclick="closeModal1()">
                        <span aria-hidden="true" class="text-white btn-sm btn-danger">Close</span>
                    </button>
                </div>
                <div class="modal-body bg-light">
                    <div class="body">
                        <div role="tabpanel" class="tab-pane" id="timeline">
                            <ul class="cbp_tmtimeline">
                                <?php if (!empty($data1)) {
                                    while ($row = $data1->fetch_assoc()) {
                                        $ps1[] = $row;
                                    }

                                    foreach ($ps1 as $s_data) {
                                ?>
                                        <li>
                                            <time class="cbp_tmtime"><span class="hidden"><?php echo $s_data['activity_date']; ?></span></time>
                                            <div class="cbp_tmicon"><i class="zmdi zmdi-account"></i></div>
                                            <div class="cbp_tmlabel">
                                                <h2><a href="javascript:void(0);">
                                                        APPLICANT
                                                    </a></h2>
                                                <h5><?php echo $s_data['stage_activity']; ?></h5>
                                                <p><?php echo $s_data['comments']; ?></p>
                                                <p><?php echo $pf_data['promo_comments']; ?></p>
                                                <a href="downloadfile1/<?php echo $pf_data['promotion_id']; ?>" class="btn btn-primary btn-sm btn-round" class="btn btn-primary btn-sm btn-round" title="<?php echo basename($pf_data['promo_doc1']) ?>">
                                                    <i class="zmdi zmdi-collection-pdf"></i> Download CV
                                                </a>
                                                <?php if (!empty($pf_data['apply_form'])) : ?>
                                                    <a href="downloadfile/<?php echo $pf_data['promotion_id']; ?>" class="btn btn-primary btn-sm btn-round" class="btn btn-primary btn-sm btn-round" title="<?php echo basename($pf_data['promo_doc2']) ?>">
                                                        <i class="zmdi zmdi-collection-pdf"></i> Download Papers
                                                    </a>
                                                    <a href="downloadfile2/<?php echo $pf_data['promotion_id']; ?>" class="btn btn-primary btn-sm btn-round" class="btn btn-primary btn-sm btn-round" title="<?php echo basename($pf_data['apply_form']) ?>">
                                                        <i class="zmdi zmdi-collection-pdf"></i> Download Form
                                                    </a>
                                                <?php endif; ?>
                                                <?php if (!empty($promonew_data['app_letter'])) : ?>
                                                    <a href="downloadfile_promos/<?php echo $promonew_data['id']; ?>:app_letter" class="btn btn-primary btn-sm btn-round" class="btn btn-primary btn-sm btn-round" title="<?php echo basename($promonew_data['app_letter']) ?>">
                                                        <i class="zmdi zmdi-collection-pdf"></i> Download Letter
                                                    </a>
                                                <?php endif; ?>
                                                <?php foreach ($ps22 as $promonew_file_data) { ?>
                                                    <a href="downloadfile_promos_papers/<?php echo $promonew_file_data['id']; ?>:file" class="btn btn-primary btn-sm btn-round" title="Download Paper">
                                                        <i class="zmdi zmdi-collection-pdf"></i> <?php echo $promonew_file_data['title'] ?>
                                                    </a>
                                                <?php } ?>
                                            </div>
                                        </li>
                                <?php }
                                } ?>
                                <?php if (!empty($data0)) {
                                    while ($row = $data0->fetch_assoc()) {
                                        $ps0[] = $row;
                                    }
                                    foreach ($ps0 as $r_data) {
                                ?>
                                        <li>
                                            <time class="cbp_tmtime"><span class="hidden"><?php echo $r_data['act_activity_date']; ?></span></time>
                                            <?php if ($r_data['act_returned'] == 1) { ?>
                                                <div class="cbp_tmicon bg-danger"><i class="zmdi zmdi-undo"></i></div>
                                            <?php } elseif ($r_data['activity'] == 1) { ?>
                                                <div class="cbp_tmicon bg-success"><i class="zmdi zmdi-thumb-up"></i></div>
                                            <?php } elseif ($r_data['activity'] == 2) { ?>
                                                <div class="cbp_tmicon bg-danger"><i class="zmdi zmdi-thumb-down"></i></div>
                                            <?php } else { ?>
                                                <div class="cbp_tmicon"><i class="zmdi zmdi-account"></i></div>
                                            <?php } ?>
                                            <div class="cbp_tmlabel">
                                                <h2>
                                                    <a href="javascript:void(0);">
                                                        <?php if ($r_data['act_promo_status'] == 1 && $r_data['act_returned'] == 1) {
                                                            echo 'HOD to APPLICANT';
                                                        } elseif ($r_data['act_promo_status'] == 2 && $r_data['act_returned'] == 1) {
                                                            echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'DIRECTOR to APPLICANT' : 'DEAN to APPLICANT';
                                                        } elseif ($r_data['act_promo_status'] == 3 && $r_data['act_returned'] == 1) {
                                                            echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'REGISTRAR to APPLICANT' : 'PROVOST to APPLICANT';
                                                        } elseif ($r_data['act_promo_status'] == 1 && $r_data['activity'] == 1) {
                                                            echo 'HOD to APPLICANT';
                                                        } elseif ($r_data['act_promo_status'] == 2 && $r_data['activity'] == 1) {
                                                            echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'HOD' : 'HOD';
                                                        } elseif ($r_data['act_promo_status'] == 3 && $r_data['activity'] == 1) {
                                                            echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'DIRECTOR' : 'DEAN';
                                                        } elseif ($r_data['act_promo_status'] == 4 && $r_data['activity'] == 1) {
                                                            echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'REGISTRAR' : 'PROVOST';
                                                        } elseif ($r_data['act_promo_status'] == 1 && $r_data['activity'] < 7) {
                                                            echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'HOD' : 'HOD';
                                                        } elseif ($r_data['act_promo_status'] == 2 && $r_data['activity'] < 7) {
                                                            echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'DIRECTOR to APPLICANT' : 'DEAN to APPLICANT';
                                                        } elseif ($r_data['act_promo_status'] == 3 && $r_data['activity'] < 7) {
                                                            echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'REGISTRAR to APPLICANT' : 'PROVOST to APPLICANT';
                                                        } elseif ($r_data['act_promo_status'] == 4 && $r_data['activity'] < 7) {
                                                            echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'HR' : 'HR';
                                                        } elseif ($r_data['act_promo_status'] == 5 && $r_data['activity'] < 7) {
                                                            echo $r_data['stage_activity'];
                                                        } elseif ($r_data['act_promo_status'] == 6 && $r_data['activity'] < 7) {
                                                            echo $r_data['stage_activity'];
                                                        } elseif ($r_data['act_promo_status'] == 7 && $r_data['activity'] < 7) {
                                                            echo $r_data['stage_activity'] . ($r_data['stage_activity'] == 'Approved') ? '-PROMOTED' : '';
                                                        } elseif ($r_data['act_promo_status'] == 1 && $r_data['activity'] > 7) {
                                                            echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'APPLICANT to HOD' : 'APPLICANT to HOD';
                                                        } elseif ($r_data['act_promo_status'] == 2 && $r_data['activity'] > 7) {
                                                            echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'APPLICANT to DIRECTOR' : 'APPLICANT to DEAN';
                                                        } elseif ($r_data['act_promo_status'] == 3 && $r_data['activity'] > 7) {
                                                            echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'APPLICANT to REGISTRAR' : 'APPLICANT to PROVOST';
                                                        } else {
                                                            echo 'APPLICANT';
                                                        }; ?>

                                                    </a>
                                                </h2>
                                                <h5><?php echo $r_data['stage_activity']; ?></h5>
                                                <p><?php echo $r_data['act_comments']; ?></p>
                                                <?php if (!empty($r_data['updatedpapers'])) { ?>
                                                    <a href="downloadup/<?php echo basename($r_data['updatedpapers']); ?>" class="btn btn-primary btn-sm btn-round" class="btn btn-primary btn-sm btn-round" data-toggle="tooltip" data-placement="top" title="<?php echo basename($r_data['stage_file']) ?>">
                                                        Download Updated Papers
                                                    </a>
                                                <?php }
                                                if (!empty($r_data['updatedcv'])) { ?>
                                                    <a href="downloadup/<?php echo basename($r_data['updatedcv']); ?>" class="btn btn-primary btn-sm btn-round" class="btn btn-primary btn-sm btn-round" data-toggle="tooltip" data-placement="top" title="<?php echo basename($r_data['stage_file']) ?>">
                                                        Download Updated CV
                                                    </a>
                                                <?php }
                                                if (!empty($r_data['updatedform'])) { ?>
                                                    <a href="downloadup/<?php echo basename($r_data['updatedform']); ?>" class="btn btn-primary btn-sm btn-round" class="btn btn-primary btn-sm btn-round" data-toggle="tooltip" data-placement="top" title="<?php echo basename($r_data['stage_file']) ?>">
                                                        Download Updated Application Form
                                                    </a>
                                                <?php } ?>
                                                <?php if ($r_data['promo_status'] == 2 && $r_data['activity'] == 1) {  ?>
                                                    <?php if ($stagen == 0) {
                                                    } else { ?>
                                                        <a href="download/<?php echo basename($r_data['stage_file']); ?>" class="btn btn-primary btn-sm btn-round" class="btn btn-primary btn-sm btn-round" data-toggle="tooltip" data-placement="top" title="<?php echo basename($r_data['stage_file']) ?>">
                                                            Download HoD's Report
                                                        </a>
                                                    <?php } ?>
                                                <?php } ?>
                                                <?php if ($r_data['promo_status'] == 3 && $r_data['activity'] == 1) {  ?>
                                                    <?php if ($stagen == 0) {
                                                    } else { ?>
                                                        <a href="download/<?php echo basename($r_data['stage_file']); ?>" class="btn btn-primary btn-sm btn-round" class="btn btn-primary btn-sm btn-round" data-toggle="tooltip" data-placement="top" title="<?php echo basename($r_data['stage_file']) ?>">
                                                            Download Confidential File Attached By
                                                            <?= (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') ?>
                                                        </a>
                                                    <?php } ?>
                                                <?php } ?>
                                                <?php if ($r_data['promo_status'] == 4 && $r_data['activity'] == 1) {  ?>
                                                    <?php if ($stagen == 0) {
                                                    } else { ?>
                                                        <a href="download/<?php echo basename($r_data['stage_file']); ?>" class="btn btn-primary btn-sm btn-round" class="btn btn-primary btn-sm btn-round" data-toggle="tooltip" data-placement="top" title="<?php echo basename($r_data['stage_file']) ?>">
                                                            Download Confidential File Attached By
                                                            <?= (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') ?>
                                                        </a>
                                                    <?php } ?>
                                                <?php } ?>
                                                <?php if ($r_data['promo_status'] == 7 && $r_data['activity'] == 1) {  ?>
                                                    <a href="download/<?php echo basename($r_data['stage_file']); ?>" class="btn btn-primary btn-sm btn-round" class="btn btn-primary btn-sm btn-round" data-toggle="tooltip" data-placement="top" title="<?php echo basename($r_data['stage_file']) ?>">
                                                        Download File Attached By HR
                                                    </a>
                                                <?php } ?>
                                            </div>
                                        </li>
                                        <?php if ($r_data['act_promo_status'] == 5) {  ?>
                                            <?php
                                            if ($stagen == 1 || $stagen == 2) {
                                                if (!empty($r_data['assessor1'])) {
                                            ?>
                                                    <li>
                                                        <time class="cbp_tmtime"><span><?= $r_data['activity_date']; ?></span></time>
                                                        <div class="cbp_tmicon bg-danger"><i class="zmdi zmdi-thumb-up"></i></div>
                                                        <div class="cbp_tmlabel">
                                                            <h2><a href="javascript:void(0);"><?= $r_data['stage_activity']; ?></a></h2>
                                                            <blockquote>
                                                                <p class="blockquote blockquote-primary">
                                                                    <?= $r_data['act_comments'] ?>
                                                                    <br>
                                                                    <small>
                                                                        -<?= $r_data['assessor1']; ?>
                                                                    </small>
                                                                </p>
                                                            </blockquote>
                                                        </div>
                                                    </li>
                                                <?php }
                                                if (!empty($r_data['assessor2'])) { ?>
                                                    <li>
                                                        <time class="cbp_tmtime"><span><?= $r_data['activity_date'] ?></span></time>
                                                        <div class="cbp_tmicon bg-danger"><i class="zmdi zmdi-thumb-up"></i></div>
                                                        <div class="cbp_tmlabel">
                                                            <h2><a href="javascript:void(0);"><?= $r_data['stage_activity'] ?></a></h2>
                                                            <blockquote>
                                                                <p class="blockquote blockquote-primary">
                                                                    <?= $r_data['act_comments'] ?>
                                                                    <br>
                                                                    <small>
                                                                        -<?= $r_data['assessor2']; ?>
                                                                    </small>
                                                                </p>
                                                            </blockquote>
                                                        </div>
                                                    </li>
                                                <?php
                                                }
                                                if (!empty($r_data['assessor3'])) { ?>
                                                    <li>
                                                        <time class="cbp_tmtime"><span><?= $r_data['activity_date'] ?></span></time>
                                                        <div class="cbp_tmicon bg-danger"><i class="zmdi zmdi-thumb-up"></i></div>
                                                        <div class="cbp_tmlabel">
                                                            <h2><a href="javascript:void(0);"><?= $r_data['stage_activity'] ?></a></h2>
                                                            <blockquote>
                                                                <p class="blockquote blockquote-primary">
                                                                    <?= $r_data['act_comments'] ?>
                                                                    <br>
                                                                    <small>
                                                                        - <?= $r_data['assessor3']; ?>
                                                                    </small>
                                                                </p>
                                                            </blockquote>
                                                        </div>
                                                    </li>
                                                <?php
                                                }
                                                if (!empty($r_data['assessor4'])) {
                                                ?>
                                                    <li>
                                                        <time class="cbp_tmtime"><span><?= $r_data['activity_date'] ?></span></time>
                                                        <div class="cbp_tmicon bg-danger"><i class="zmdi zmdi-thumb-up"></i></div>
                                                        <div class="cbp_tmlabel">
                                                            <h2><a href="javascript:void(0);"><?= $r_data['stage_activity'] ?></a></h2>
                                                            <blockquote>
                                                                <p class="blockquote blockquote-primary">
                                                                    <?= $r_data['act_comments'] ?>
                                                                    <br>
                                                                    <small>
                                                                        - <?= $r_data['assessor4']; ?>
                                                                    </small>
                                                                </p>
                                                            </blockquote>
                                                        </div>
                                                    </li>
                                                <?php
                                                }

                                                if (!empty($r_data['assessor5'])) {
                                                ?>
                                                    <li>
                                                        <time class="cbp_tmtime"><span><?= $r_data['activity_date'] ?></span></time>
                                                        <div class="cbp_tmicon bg-danger"><i class="zmdi zmdi-thumb-up"></i></div>
                                                        <div class="cbp_tmlabel">
                                                            <h2><a href="javascript:void(0);"><?= $r_data['stage_activity'] ?></a></h2>
                                                            <blockquote>
                                                                <p class="blockquote blockquote-primary">
                                                                    <?= $r_data['act_comments'] ?>
                                                                    <br>
                                                                    <small>
                                                                        - <?= $r_data['assessor5']; ?>
                                                                    </small>
                                                                </p>
                                                            </blockquote>
                                                        </div>
                                                    </li>
                                                <?php
                                                }

                                                if (!empty($r_data['assessor6'])) {
                                                ?>
                                                    <li>
                                                        <time class="cbp_tmtime"><span><?= $r_data['activity_date'] ?></span></time>
                                                        <div class="cbp_tmicon bg-danger"><i class="zmdi zmdi-thumb-up"></i></div>
                                                        <div class="cbp_tmlabel">
                                                            <h2><a href="javascript:void(0);"><?= $r_data['stage_activity'] ?></a></h2>
                                                            <blockquote>
                                                                <p class="blockquote blockquote-primary">
                                                                    <?= $r_data['act_comments'] ?>
                                                                    <br>
                                                                    <small>
                                                                        - <?= $r_data['assessor6']; ?>
                                                                    </small>
                                                                </p>
                                                            </blockquote>
                                                        </div>
                                                    </li>
                                                <?php
                                                } ?>

                                                <?php
                                            } else {
                                                if (!empty($r_data['assessor1'])) {
                                                ?>
                                                    <li>
                                                        <time class="cbp_tmtime"><span><?= $r_data['activity_date'] ?></span></time>
                                                        <div class="cbp_tmicon bg-danger"><i class="zmdi zmdi-thumb-up"></i></div>
                                                        <div class="cbp_tmlabel">
                                                            <h2><a href="javascript:void(0);"><?= $r_data['stage_activity'] ?>nkj</a></h2>
                                                            <blockquote>
                                                                <p class="blockquote blockquote-primary">
                                                                    <?= $r_data['act_comments'] ?>
                                                                    <br>
                                                                </p>
                                                            </blockquote>
                                                        </div>
                                                    </li>
                                            <?php
                                                }
                                            } ?>
                                        <?php } ?>
                                <?php }
                                } ?>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <script>
        function closeModal() {
            jQuery('#status_modal').modal('hide');
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        }

        $('#status_modal').on('hidden.bs.modal', function() {
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        });

        function closeModal() {
            jQuery('#status_modal').modal('hide');
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        }

        $('#status_modal').on('hidden.bs.modal', function() {
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        });
    </script>

<?php

});

$app->post('/procuremodal_status', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    $r = $app->request();
    $promo_id = $r->post('promo_id');
    $promo = explode(',', $promo_id);
    $pid = $promo[0];
    $stagen = $promo[1];

    $unit = $_SESSION['user']['college_id'];

    $pos_sql = $db->query("SELECT t1.*, t3.company_name, t3.phone, t3.email,t4.short_name, concat(t5.fname,' ',t5.lname) as staffname, concat(t6.fname,' ',t6.lname) as staff_assigned, t6.phone as staff_assigned_phone FROM procurement.request_log as t1 left join procurement.request as t2 on t1.request_id = t2.request_id left join procurement.suppliers as t3 on t2.supplier_id = t3.supplier_id left join hr.unit as t4 on t1.unit_id = t4.id left join hr.staff as t5 on t1.staff_no = t5.staff_no left join hr.staff as t6 on t2.assigned_staff = t6.staff_no where t1.request_id = $pid and t1.type > 0");

    $staff_ass = $db->query("SELECT * FROM procurement.users where college_id = $unit");


    // var_dump($ps5);
    // die();
?>
    <div class="modal fade right status_modal" id="status_modal" tabindex="-1" role="dialog" style="width:50%; height:100%;" aria-labelledby="myModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable modal-notify modal-success modal-side modal-top-right" role="document">
            <div class="modal-content" style="border-radius: 10px 10px;">
                <div class="modal-header bg-primary" style="height:70px;">
                    <h4 class="text-white" style="margin-top:-10px;">Procurement Stages</h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" onclick="closeModal1()">
                        <span aria-hidden="true" class="text-white btn-sm btn-danger">Close</span>
                    </button>
                </div>
                <div class="modal-body bg-light">
                    <div class="body">
                        <div role="tabpanel" class="tab-pane" id="timeline">
                            <ul class="cbp_tmtimeline">
                                <?php if (!empty($pos_sql)) {
                                    while ($row = $pos_sql->fetch_assoc()) {
                                        $ps1[] = $row;
                                    }
                                    // var_dump($ps1);die();
                                    foreach ($ps1 as $s_data) {
                                ?>
                                        <li>
                                            <time class="cbp_tmtime"><span class="hidden"><?php echo $s_data['request_date']; ?></span></time>
                                            <div class="cbp_tmicon"><i class="zmdi zmdi-account"></i></div>
                                            <div class="cbp_tmlabel">
                                                <h2><a href="javascript:void(0);">
                                                        <?php if ($_SESSION['user']['staff_type'] == 'NON-ACADEMIC') : ?>
                                                            <!-- <?php echo $s_data['stage'] . ' ' . $s_data['stage_status'] . ' ' . $s_data['status'] . ' ' . $s_data['id']; ?>  -->

                                                            <?= (($s_data['stage'] == 1 && $s_data['stage_status'] == 1 && $s_data['status'] == 0) ? 'HOD Made Procurement Request' : (($s_data['stage'] == 2 && $s_data['stage_status'] == 1 && $s_data['status'] == 2) ? 'Director Approved' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 1 && $s_data['status'] == 2) ? 'Director Approved' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 1 && $s_data['status'] == 2) ? 'Procurement On Going' : (($s_data['stage'] == 2 && $s_data['stage_status'] == 2 && $s_data['status'] == 1) ? 'Director Disapproved' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 2 && $s_data['status'] == 2) ? 'Vice Chancellor Disapproved' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 1 && $s_data['status'] == 0) ? 'Director Made Procurement Request' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 1 && $s_data['status'] == 0) ? 'VC Made Procurement Request' : (($s_data['stage'] == 5 && $s_data['stage_status'] == 1 && $s_data['status'] == 5) ? 'Procurement On Going' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 3 && $s_data['status'] == 3) ? 'Awaiting Comment/Review' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 1 && $s_data['status'] == 4) ? 'Vice Chancellor Approve' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 4 && $s_data['status'] == 2) ? 'Comment/Review Given By ' . $s_data['staffname'] . ' of ' . $s_data['short_name'] : (($s_data['stage'] == 3 && $s_data['stage_status'] == 4 && $s_data['status'] == 4) ? 'Comment/Review Given By ' . $s_data['staffname'] . ' of ' . $s_data['short_name'] : (($s_data['stage'] == 4 && $s_data['stage_status'] == 5 && $s_data['status'] == 4) ? 'Grouping Done By Procurement - Officer Assigned: ' . $s_data['staff_assigned'] . ' - ' . $s_data['staff_assigned_phone'] : (($s_data['stage'] == 4 && $s_data['stage_status'] == 4 && $s_data['status'] == 6) ? 'Supplier Recommended - ' . $s_data['company_name'] : (($s_data['stage'] == 1 && $s_data['stage_status'] == 2 && $s_data['status'] == 2) ? 'Director Disapproved' : (($s_data['stage'] == 1 && $s_data['stage_status'] == 2 && $s_data['status'] == 3) ? 'Director Disapproved' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 2 && $s_data['status'] == 4) ? 'VC Disapproved' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 6 && $s_data['status'] == 4) ? 'Quotations Given' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 7 && $s_data['status'] == 4) ? 'Supplier Recommended - ' . $s_data['company_name'] : (($s_data['status'] == 9) ? 'Pricing Given By Procurement' : (($s_data['stage'] == 6 && $s_data['stage_status'] == 1 && $s_data['status'] == 4) ? 'Items Received At Stores' : (($s_data['stage'] == 2 && $s_data['stage_status'] == 2 && $s_data['status'] == 3) ? 'Registrar Disapproved' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 1 && $s_data['status'] == 3) ? 'Registrar Approved' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 8 && $s_data['status'] == 4) ? 'Comment From Procurement' : (($s_data['stage'] == 5 && $s_data['stage_status'] == 8 && $s_data['status'] == 4) ? 'Comment From Stores' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 11 && $s_data['status'] == 4) ? 'Assigned To Staff' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 1 && $s_data['status'] == 3) ? 'Vice Chancellor Approved' : '')))))))))))))))))))))))))))); ?>

                                                        <?php elseif ($_SESSION['user']['staff_type'] == 'ACADEMIC') : ?>
                                                            <!-- <?php echo $s_data['stage'] . ' ' . $s_data['stage_status'] . ' ' . $s_data['status'] . ' ' . $s_data['id']; ?> -->

                                                            <?= (($s_data['stage'] == 1 && $s_data['stage_status'] == 1 && $s_data['status'] == 1) ? 'HOD Made Procurement Request' : (($s_data['stage'] == 2 && $s_data['stage_status'] == 1 && $s_data['status'] == 2) ? 'Dean Approved' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 1 && $s_data['status'] == 3) ? 'Provost Approved' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 1 && $s_data['status'] == 4) ? 'Vice Chancellor Approved' : (($s_data['stage'] == 5 && $s_data['stage_status'] == 1 && $s_data['status'] == 5) ? 'Procurement On Going' : (($s_data['stage'] == 2 && $s_data['stage_status'] == 2 && $s_data['status'] == 1) ? 'Dean Disapproved' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 2 && $s_data['status'] == 2) ? 'Provost Disapproved' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 2 && $s_data['status'] == 2) ? 'Vice Chancellor Disapproved' : (($s_data['stage'] == 1 && $s_data['stage_status'] == 1 && $s_data['status'] == 0) ? 'HOD Made Procurement Request' : (($s_data['stage'] == 2 && $s_data['stage_status'] == 1 && $s_data['status'] == 0) ? 'Dean Made Procurement Request' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 1 && $s_data['status'] == 0) ? 'Provost Made Procurement Request' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 1 && $s_data['status'] == 0) ? 'VC Made Procurement Request' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 1 && $s_data['status'] == 2) ? 'Dean Approved' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 1 && $s_data['status'] == 2) ? 'Dean Approved' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 1 && $s_data['status'] == 3) ? 'Provost Approved' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 1 && $s_data['status'] == 3) ? 'Provost Approved' : (($s_data['stage'] == 5 && $s_data['stage_status'] == 1 && $s_data['status'] == 4) ? 'Procurement In Progress' : (($s_data['stage'] == 2 && $s_data['stage_status'] == 1 && $s_data['status'] == 1) ? 'Dean Made Procurement Request' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 1 && $s_data['status'] == 1) ? 'Provost Made Procurement Request' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 1 && $s_data['status'] == 1) ? 'VC Made Procurement Request' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 3 && $s_data['status'] == 3) ? 'Awaiting Comment/Review' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 4 && $s_data['status'] == 3) ? 'Comment/Review Given By ' . $s_data['staffname'] . ' of ' . $s_data['short_name'] : (($s_data['stage'] == 3 && $s_data['stage_status'] == 4 && $s_data['status'] == 4) ? 'Comment/Review Given By ' . $s_data['staffname'] . ' of ' . $s_data['short_name'] : (($s_data['stage'] == 4 && $s_data['stage_status'] == 5 && $s_data['status'] == 4) ? 'Grouping Done By Procurement - Officer Assigned: ' . $s_data['staff_assigned'] . ' - ' . $s_data['staff_assigned_phone'] : (($s_data['stage'] == 4 && $s_data['stage_status'] == 4 && $s_data['status'] == 6) ? 'Supplier Recommended - ' . $s_data['company_name'] : (($s_data['stage'] == 1 && $s_data['stage_status'] == 2 && $s_data['status'] == 2) ? 'Dean Disapproved' : (($s_data['stage'] == 2 && $s_data['stage_status'] == 2 && $s_data['status'] == 3) ? 'Provost Disapproved' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 2 && $s_data['status'] == 4) ? 'VC Disapproved' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 6 && $s_data['status'] == 4) ? 'Suppliers Quotations Given' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 7 && $s_data['status'] == 4) ? 'Supplier Recommended - ' . $s_data['company_name'] : (($s_data['status'] == 9) ? 'Pricing Given By Procurement' : (($s_data['stage'] == 6 && $s_data['stage_status'] == 1 && $s_data['status'] == 4) ? 'Items Received At Stores' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 8 && $s_data['status'] == 4) ? 'Comment From Procurement' : (($s_data['stage'] == 5 && $s_data['stage_status'] == 8 && $s_data['status'] == 4) ? 'Comment From Stores' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 11 && $s_data['status'] == 4) ? 'Assigned To Staff' : ''))))))))))))))))))))))))))))))))))); ?>

                                                        <?php endif; ?>
                                                    </a></h2>
                                                <!-- <p><?php echo $s_data['item_description']; ?></p> -->
                                                <p><?php echo $s_data['comments']; ?> <br>
                                                    <?php echo $s_data['item_description']; ?></p>
                                            </div>
                                        </li>
                                <?php }
                                } ?>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <script>
        function closeModal() {
            jQuery('#status_modal').modal('hide');
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        }

        $('#status_modal').on('hidden.bs.modal', function() {
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        });

        function closeModal() {
            jQuery('#status_modal').modal('hide');
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        }

        $('#status_modal').on('hidden.bs.modal', function() {
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        });
    </script>

<?php

});

$app->post('/procuremodal_edit', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    $r = $app->request();
    $promo_id = $r->post('promo_id');
    $promo = explode(',', $promo_id);
    $pid = $promo[0];
    $stagen = $promo[1];

    $pos_sql = $db->query("SELECT *, t1.id FROM procurement.request_breakdown as t1 
  left join procurement.req_type as t2 on t1.product_id = t2.id where request_id = $pid");

    $pos_sqlreq = $db->query("SELECT * FROM procurement.request where request_id = $pid");
    $ps2 = [];

    while ($row = $pos_sqlreq->fetch_assoc()) {
        $ps2[] = $row;
    }
    // var_dump($ps5);
    // die();
?>
    <div class="modal fade right status_modal" id="status_modal" tabindex="-1" role="dialog" style="width:100%; height:100%;" aria-labelledby="myModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable modal-success" role="document">
            <div class="modal-content" style="border-radius: 10px 10px;">
                <div class="modal-header bg-primary" style="height:70px;">
                    <h4 class="text-white" style="margin-top:-10px;">Procurement List </h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" onclick="closeModal1()">
                        <span aria-hidden="true" class="text-white btn-sm btn-danger">Close</span>
                    </button>
                </div>
                <div class="modal-body bg-light">
                    <div class="body">
                        <div role="tabpanel" class="tab-pane">
                            <ul>
                                <?php if (!empty($pos_sql)) {
                                    while ($row = $pos_sql->fetch_assoc()) {
                                        $ps1[] = $row;
                                    }
                                    // var_dump($ps1);die();
                                    // foreach($ps1 as $s_data){
                                ?>
                                    <form id="proDelForm" method="post">
                                        <table class="table">
                                            <thead class="thead-dark">
                                                <tr>
                                                    <th nowrap>Item No.</th>
                                                    <!-- <th>Product</th> -->
                                                    <th>Description</th>
                                                    <th>Quantity</th>
                                                    <th>Unit Price</th>
                                                    <th>Total Price</th>
                                                    <th>Budgeted/Unbudgeted</th>
                                                    <?php if (isset($_SESSION['uhead']) && $_SESSION['uhead'] == '01') : ?>
                                                        <th>Approve/Disapprove</th>
                                                    <?php endif; ?>
                                                    <!-- <th>Action</th> -->
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <?php
                                                $i = 1;
                                                foreach ($ps1 as $procure_data) : ?>
                                                    <tr>
                                                        <td><?= $i++; ?></td>
                                                        <!-- <td><?= $procure_data['type_name']; ?></td> -->
                                                        <td><textarea placeholder="Description" name="desc[]" value="" id="procdesc"><?= $procure_data['item_desc']; ?></textarea></td>
                                                        <!-- onchange="procure_update1(<?= $procure_data['id']; ?>)" -->
                                                        <td><input type="number" name="quantity[]" id="quantity" value="<?= $procure_data['quantity']; ?>" placeholder="Quantity">
                                                        </td>
                                                        <td><input type="number" name="u_price[]" readonly id="u_price" value="<?= $procure_data['unit_price']; ?>" placeholder="Unit Price">
                                                        </td>
                                                        <td><input type="number" name="t_price[]" readonly="" id="t_price" value="<?= $procure_data['total_price']; ?>" placeholder="Total Price"></td>
                                                        <td>
                                                            <p class="<?= (($procure_data['budget_state'] == 'UNBUDGETED') ? 'badge badge-danger' : 'badge badge-success') ?>">
                                                                <?= $procure_data['budget_state']; ?></p>
                                                        </td>
                                                        <?php if (isset($_SESSION['uhead']) && $_SESSION['uhead'] == '01' && $procure_data['budget_state'] == 'UNBUDGETED' && $procure_data['total_price'] <= 15000) : ?>
                                                            <td>
                                                                <select class="form-control" name="unbudgeted_approve[]" id="unbudgeted_approve">
                                                                    <option value="<?= (empty($procure_data['budget_status']) ? 'Approve' : $procure_data['budget_status']) ?>">
                                                                        <?= (empty($procure_data['budget_status']) ? '- Approve/Disapprove -' : $procure_data['budget_status']) ?>
                                                                    </option>
                                                                    <option value="Approve">Approve</option>
                                                                    <option value="Disapprove">Disapprove</option>
                                                                </select>
                                                            </td>
                                                        <?php endif; ?>
                                                        <input type="hidden" name="rid" id="rid" value="<?= $procure_data['request_id']; ?>">
                                                        <input type="hidden" name="rbid[]" id="rbid" value="<?= $procure_data['id']; ?>">
                                                        <!--<td>
                                            <div class="row">
                                                 <div class="col-md-6">
                                                    <button onclick="procure_update(<?= $procure_data['id']; ?>)" class="btn gradient-shadow gradient-45deg-indigo-blue btn-small btn-block btn-round font-weight-bold h6">
                                                    Update
                                                    </button>
                                                </div> 
                                                <div class="col-md-12">
                                                    <button onclick="procure_del(<?= $procure_data['id']; ?>)" class="btn btn-primary btn-block btn-round font-weight-bold h6">
                                                    Delete
                                                    </button>
                                                </div>                                                                
                                            </div>                                                    
                                        </td>-->
                                                    </tr>
                                                <?php endforeach; ?>
                                                <tr>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td>Total: <?= $ps2[0]['total_price']; ?></td>
                                                </tr>
                                            </tbody>
                                        </table><br>
                                        <div class="row">
                                            <div class="col-sm-12" id="send">
                                                <div class="form-group">
                                                    <div class="text-center"><input type="submit" id="done" name="done" style="background-color:#D2262D;" class="btn btn-block font-weight-bold text-white btn-danger btn-round" value="Update Request(s)"></div>
                                                </div>
                                            </div>
                                        </div>

                                    </form>
                                <?php

                                    //}
                                } ?>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <script>
        function closeModal() {
            jQuery('#status_modal').modal('hide');
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        }

        $('#status_modal').on('hidden.bs.modal', function() {
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        });

        function closeModal() {
            jQuery('#status_modal').modal('hide');
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        }

        $('#status_modal').on('hidden.bs.modal', function() {
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        });

        function procure_del(id) {
            var data = id;
            jQuery.ajax({
                url: "del_procurement",
                method: "post",
                data: "procure_id=" + data + ',' + '1',
                success: function(data) {
                    Swal.fire({
                        title: 'Success!!!',
                        html: '<span class="text-danger">' + response.message + '</span>',
                        showConfirmButton: false,
                        width: 300,
                        height: 200,
                        imageUrl: '../../public/images/logo/logo.png',
                        imageWidth: 100,
                        imageHeight: 100,
                        imageAlt: 'Custom image',
                        timer: 3000
                    }).then(function() {
                        // location.replace("https://comedigitalize.com");
                        location.reload();
                    });
                },
                error: function() {
                    alert("Something went wrong");
                }
            });
        }

        $(document).ready(function() {
            $('#proDelForm').on('submit', function(event) {
                event.preventDefault();
                var form_data = new FormData(this);
                // var file_data = $("#input-folder-3").fileinput();
                // var file_data1 = $('.file-size-info');
                // form_data.append('file', file_data);
                $.ajax({
                    url: "update_procurementdd",
                    method: "POST",
                    dataType: 'text',
                    cache: false,
                    contentType: false,
                    processData: false,
                    data: form_data,
                    success: function(data) {
                        console.log(data);
                        var response = JSON.parse(data);
                        console.log(response.status);
                        if (response.status == 'success') {
                            Swal.fire({
                                title: 'Success!!!',
                                html: '<span class="text-danger">' + response.message +
                                    '</span>',
                                showConfirmButton: false,
                                width: 300,
                                height: 200,
                                imageUrl: '../../public/images/logo/logo.png',
                                imageWidth: 100,
                                imageHeight: 100,
                                imageAlt: 'Custom image',
                                timer: 3000
                            }).then(function() {
                                // location.replace("https://comedigitalize.com");
                                location.reload();
                            });
                            // $('#proDelForm')[0].reset();
                            //   $('#sub_form').html(data);
                        } else if (response.status == 'error') {
                            Swal.fire({
                                position: 'top-right',
                                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                                html: '<span class="text-danger">' + response.message +
                                    '</span>',
                                showConfirmButton: false,
                                width: 300,
                                height: 200,
                                imageUrl: '../../public/images/logo/logo.png',
                                imageWidth: 100,
                                imageHeight: 100,
                                imageAlt: 'Custom image',
                                timer: 3000
                            });
                        }

                    }
                });

            });
        });
    </script>

<?php

});

$app->post('/procuremodal_view', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    $r = $app->request();
    $promo_id = $r->post('promo_id');
    $promo = explode(',', $promo_id);
    $pid = $promo[0];
    $stagen = $promo[1];

    $pos_sql = $db->query("SELECT *, t1.id FROM procurement.request_breakdown as t1 
  left join procurement.req_type as t2 on t1.product_id = t2.id where request_id = $pid");

    $pos_sqlreq = $db->query("SELECT * FROM procurement.request where request_id = $pid");
    $ps2 = [];

    while ($row = $pos_sqlreq->fetch_assoc()) {
        $ps2[] = $row;
    }

    // var_dump($ps2);
    // die();
?>
    <div class="modal fade right status_modal" id="status_modal" tabindex="-1" role="dialog" style="width:100%; height:100%;" aria-labelledby="myModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable modal-success" role="document">
            <div class="modal-content" style="border-radius: 10px 10px;">
                <div class="modal-header bg-primary" style="height:70px;">
                    <h4 class="text-white" style="margin-top:-10px;">Procurement List </h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" onclick="closeModal1()">
                        <span aria-hidden="true" class="text-white btn-sm btn-danger">Close</span>
                    </button>
                </div>
                <div class="modal-body bg-light">
                    <div class="body">
                        <div role="tabpanel" class="tab-pane">
                            <ul>
                                <?php if (!empty($pos_sql)) {
                                    while ($row = $pos_sql->fetch_assoc()) {
                                        $ps1[] = $row;
                                    }
                                    // var_dump($ps1);die();
                                    // foreach($ps1 as $s_data){
                                ?>
                                    <form id="" method="post">
                                        <table class="table">
                                            <thead class="thead-dark">
                                                <tr>
                                                    <th>Item No.</th>
                                                    <!-- <th>Product</th> -->
                                                    <th>Description</th>
                                                    <th>Quantity</th>
                                                    <th>Unit Price</th>
                                                    <th>Total Price</th>
                                                    <th>Budgeted/Unbudgeted</th>
                                                    <?php if (isset($_SESSION['uhead']) && $_SESSION['uhead'] == '01') : ?>
                                                        <th>Approve/Disapprove</th>
                                                    <?php endif; ?>
                                                    <!-- <th>Action</th> -->
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <?php
                                                $i = 1;
                                                foreach ($ps1 as $procure_data) : ?>
                                                    <tr>
                                                        <td><?= $i++; ?></td>
                                                        <td><?= $procure_data['item_desc']; ?></td>
                                                        <!-- onchange="procure_update1(<?= $procure_data['id']; ?>)" -->
                                                        <td><input type="number" name="quantity[]" id="quantity" class="form-control-plaintext" readonly value="<?= $procure_data['quantity']; ?>" placeholder="Quantity">
                                                        </td>
                                                        <td><input type="number" name="quantity[]" readonly id="quantity" class="form-control-plaintext" readonly value="<?= $procure_data['unit_price']; ?>" placeholder="Quantity">
                                                        </td>
                                                        <td><input type="number" name="quantity[]" id="quantity" class="form-control-plaintext" readonly value="<?= $procure_data['total_price']; ?>" placeholder="Quantity">
                                                        </td>
                                                        <td>
                                                            <p class="<?= (($procure_data['budget_state'] == 'UNBUDGETED') ? 'badge badge-danger' : 'badge badge-success') ?>">
                                                                <?= $procure_data['budget_state']; ?></p>
                                                        </td>
                                                        <!-- <td><input type="text" name="budget_state[]" readonly="" id="budget_state" value="<?= $procure_data['budget_state']; ?>"></td> -->
                                                        <?php if (isset($_SESSION['uhead']) && $_SESSION['uhead'] == '01') : ?>
                                                            <td>
                                                                <select class="form-control" name="unbudgeted_approve[]" id="unbudgeted_approve">
                                                                    <option value="<?= (empty($procure_data['budget_status']) ? 'Approve' : $procure_data['budget_status']) ?>">
                                                                        <?= (empty($procure_data['budget_status']) ? '- Approve/Disapprove -' : $procure_data['budget_status']) ?>
                                                                    </option>
                                                                    <option value="Approve">Approve</option>
                                                                    <option value="Disapprove">Disapprove</option>
                                                                </select>
                                                            </td>
                                                        <?php endif; ?>
                                                    </tr>
                                                <?php endforeach; ?>
                                                <tr>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td>Total: <?= $ps2[0]['total_price']; ?></td>
                                                </tr>
                                            </tbody>
                                        </table><br><br><br>

                                    </form>
                                <?php

                                    //}
                                } ?>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <script>
        function closeModal() {
            jQuery('#status_modal').modal('hide');
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        }

        $('#status_modal').on('hidden.bs.modal', function() {
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        });

        function closeModal() {
            jQuery('#status_modal').modal('hide');
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        }

        $('#status_modal').on('hidden.bs.modal', function() {
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        });
    </script>

<?php

});

$app->post('/eduform', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    $file_type = ['image/jpg', 'image/png', 'image/jpeg', 'application/pdf'];
    $r = $app->request();
    $promo_id = $r->post('promo_id');
    $promo = explode(',', $promo_id);
    //var_dump($promo);
    $pid = $promo[0];
    $sno = $_SESSION['user']['staff_no'];
    $pos_sql = $db->query("select * from study_intention as t1
   left join staff as t2 on t1.staff_no = t2.staff_no where t1.id = $pid");

    $data1 = [];
    if ($pos_sql->num_rows > 0) {
        while ($row = $pos_sql->fetch_assoc()) {
            $data1[] = $row;
        }
    }
    //var_dump($data1);die();
    // foreach($data1 as $data1){}
?>
    <div class="modal fade right eduform_modal" id="eduform_modal" tabindex="-1" role="dialog" style="width:60%; height:100%;" aria-labelledby="myModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable modal-notify modal-success modal-side modal-top-right" role="document">
            <div class="modal-content" style="border-radius: 10px 10px;">
                <div class="modal-header bg-primary" style="height:70px;">
                    <h4 class="text-white" style="margin-top:-10px;">Applicant:
                        <?= $data1[0]['fname'] . ' ' . $data1[0]['lname'] ?>
                    </h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" onclick="closeModal1()">
                        <span aria-hidden="true" class="text-white btn-sm btn-danger">Close</span>
                    </button>
                </div>
                <div class="modal-body bg-light">
                    <div class="body">
                        <div class="row">
                            <div class="col-5">
                                <div class="form-group">
                                    <label for="high_edu" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Highest Educational
                                            Qualification/Programme:</strong></label>
                                    <input name="high_edu" id="high_edu" readonly class="form-control-plaintext clcin" value="<?= (!empty($data1[0]['high_edu']) ? $data1[0]['high_edu'] : '') ?>" placeholder="Highest Educational Qualification/Programme">
                                </div>
                            </div>
                            <div class="col-1">
                            </div>
                            <div class="col-5">
                                <div class="form-group">
                                    <label for="study_leave" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Last time study leave was granted, if any(State
                                            Programme, Start & End Date):</strong></label>
                                    <input name="study_leave" id="study_leave" readonly class="form-control-plaintext clcin" value="<?= (!empty($data1[0]['study_leave']) ? $data1[0]['study_leave'] : '') ?>" placeholder="Last time study leave was granted"></input>
                                </div>
                            </div>
                            <div class="col-5">
                                <div class="form-group">
                                    <label for="int_prog" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Intended programme of study</strong></label>
                                    <input name="int_prog" id="inpfm" readonly class="form-control-plaintext clcin" value="<?= (!empty($data1[0]['int_prog']) ? $data1[0]['int_prog'] : '') ?>" placeholder="Intended programme of study"></input>
                                </div>
                            </div>
                            <div class="col-1">
                            </div>
                            <div class="col-5">
                                <div class="form-group">
                                    <label for="study_place" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Intended place of study</strong></label>
                                    <input name="study_place" id="inpfm" readonly class="form-control-plaintext clcin" value="<?= (!empty($data1[0]['study_place']) ? $data1[0]['study_place'] : '') ?>" placeholder="Intended place of study"></input>
                                </div>
                            </div>
                            <div class="col-1">
                            </div>
                            <div class="col-5">
                                <div class="form-group">
                                    <label for="date_commence" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Date of commencement of programme</strong></label>
                                    <input name="date_commence" id="inpfm2" type="text" value="<?= (!empty($data1[0]['date_commence']) ? $data1[0]['date_commence'] : '') ?>" readonly class="form-control-plaintext clcin" placeholder="Date of commencement of programme"></input>
                                </div>
                            </div>
                            <div class="col-1">
                            </div>
                            <div class="col-5">
                                <div class="form-group">
                                    <label for="prog_duration" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Duration of programme(Years)</strong></label>
                                    <input name="prog_duration" id="study_leave" value="<?= (!empty($data1[0]['prog_duration']) ? $data1[0]['prog_duration'] : '') ?>" readonly class="form-control-plaintext clcin" placeholder="Duration of programme(Years)"></input>
                                </div>
                            </div>
                            <div class="col-1">
                            </div>
                            <div class="col-5">
                                <div class="form-group">
                                    <label for="study_leave" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Type of Programme</strong></label>
                                    <input name="study_leave" id="study_leave" readonly class="form-control-plaintext clcin" value="<?= ((!empty($data1) && $data1[0]['prog_type'] == 1) ? 'Full-Time' : ((!empty($data1) && $data1[0]['prog_type'] == 2) ? 'Part-Time' : '')) ?>" placeholder="Last time study leave was granted"></input>

                                </div>
                            </div>
                            <div class="col-1">
                            </div>
                            <div class="col-5">
                                <div class="form-group">
                                    <label for="study_leave" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Mode of Study</strong></label>
                                    <input name="study_leave" id="study_leave" readonly class="form-control-plaintext clcin" value="<?= (!empty($data1[0]['study_mode']) ? $data1[0]['study_mode'] : '') ?>" placeholder="Last time study leave was granted"></input>

                                </div>
                            </div>
                            <div class="col-1">
                            </div>
                            <div class="col-5">
                                <div class="form-group">
                                    <label for="study_leave" class="text-dark font-weight-bold" style="font-size:15px;"><strong>
                                            Kind of sponsorship required
                                        </strong></label>
                                    <input name="study_leave" id="study_leave" readonly class="form-control-plaintext clcin" value="<?= (!empty($data1[0]['sponsor_kind']) ? $data1[0]['sponsor_kind'] : '') ?>" placeholder="Last time study leave was granted"></input>
                                </div>
                            </div>
                            <div class="col-1">
                            </div>
                            <div class="col-5">
                                <div class="form-group">
                                    <label for="other_scholarship" class="text-dark font-weight-bold" style="font-size:15px;"><strong>
                                            Other scholarship packages obtained. If any, Please state the value of the
                                            scholarship and other details
                                        </strong></label>
                                    <input name="other_scholarship" id="study_leave" value="<?= (!empty($data1[0]['other_scholarship']) ? $data1[0]['other_scholarship'] : '') ?>" readonly class="form-control-plaintext clcin" placeholder="Other scholarship packages obtained"></input>
                                </div>
                            </div>
                            <div class="col-1">
                            </div>
                            <div class="col-5">
                                <div class="form-group">
                                    <label for="prog_relevance" class="text-dark font-weight-bold" style="font-size:15px;"><strong>
                                            Relevance of programme to department/university (Maximum 100 words)
                                        </strong></label>
                                    <p class="text-dark" readonly>
                                        <?= (!empty($data1[0]['prog_relevance']) ? $data1[0]['prog_relevance'] : '') ?></p>
                                </div>
                            </div>
                            <div class="col-1">
                            </div>
                            <div class="col-6">
                                <hr>
                                <div class="row">
                                    <div class="col-5">
                                        <div class="form-group">
                                            <h5><?= (!empty($data1[0]['signed']) ? 'Signed' : '') ?></h5>
                                        </div>
                                    </div>
                                    <div class="col-1">
                                    </div>
                                    <div class="col-5">
                                        <div class="form-group">
                                            <h5><?= (!empty($data1[0]['sub_date']) ? $data1[0]['sub_date'] : '') ?></h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <script>
        function closeModal() {
            jQuery('#eduform_modal').modal('hide');
            setTimeout(function() {
                jQuery('#eduform_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        }

        $('#eduform_modal').on('hidden.bs.modal', function() {
            setTimeout(function() {
                jQuery('#eduform_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        });

        function closeModal() {
            jQuery('#eduform_modal').modal('hide');
            setTimeout(function() {
                jQuery('#eduform_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        }

        $('#eduform_modal').on('hidden.bs.modal', function() {
            setTimeout(function() {
                jQuery('#eduform_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        });
    </script>

<?php

});

$app->post('/assessor', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    // $host = $app->host;
    $r = $app->request();
    $pid = $r->post('promo_assess');
    // die();
    $asses = $db->query("SELECT * FROM `assessors` WHERE active = 0");
    $assessor = [];
    if ($asses->num_rows > 0) {
        while ($row = $asses->fetch_assoc()) {
            $assessor[] = $row;
        }
    }
    foreach ($assessor as $promo1) {
    }
    // var_dump($assessor);
    // die();
?>
    <div class="modal fade right" id="assign_assessor" style="width:50%; height:100%;" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable" role="document">
            <div class="modal-content" style="border-radius: 10px 10px;">
                <div class="modal-header bg-primary">
                    <h5 class="text-white">Assign Assessor </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" onclick="closeModal()">
                        <span aria-hidden="true" class="text-white btn-sm btn-danger">Close</span>
                    </button>
                </div>
                <div class="modal-body bg-light">
                    <form method="POST" class="bg-light assessor_ass">
                        <div class="body bg-light">
                            <div class="row clearfix">
                                <div id="pid">
                                    <input type="hidden" id="pid" name="pid" value="<?php echo $pid; ?>">
                                </div>
                                <div class="col-lg-12 col-md-12">
                                    <div class="form-group">
                                        <label for="assessor1">Select Assessor 1</label>
                                        <select class="d-block" style="width:100%;" name="assessor1" id="assessor1">
                                            <option value="">- Assessor 1 -</option>
                                            <?php foreach ($assessor as $promo1) : ?>
                                                <option class="text-uppercase" value="<?php echo strtoupper($promo1['fname'] . ' ' . $promo1['lname']); ?>">
                                                    <?php echo strtoupper($promo1['fname'] . ' ' . $promo1['lname'] . ' ( ' . $promo1['special_area'] . ' - ' . $promo1['institution'] . ' )'); ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-lg-12 col-md-12">
                                    <div class="form-group">
                                        <label for="assessor2">Select Assessor 2</label>
                                        <select class="d-block" style="width:100%;" name="assessor2" id="assessor2">
                                            <option value="">- Assessor 2 -</option>
                                            <?php foreach ($assessor as $promo1) : ?>
                                                <option class="text-uppercase" value="<?php echo strtoupper($promo1['fname'] . ' ' . $promo1['lname']); ?>">
                                                    <?php echo strtoupper($promo1['fname'] . ' ' . $promo1['lname'] . ' ( ' . $promo1['special_area'] . ' - ' . $promo1['institution'] . ' )'); ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-lg-12 col-md-12">
                                    <div class="form-group">
                                        <label for="assessor3">Select Assessor 3</label>
                                        <select class="d-block" style="width:100%;" name="assessor3" id="assessor3">
                                            <option value="">- Assessor 3 -</option>
                                            <?php foreach ($assessor as $promo1) : ?>
                                                <option class="text-uppercase" value="<?php echo strtoupper($promo1['fname'] . ' ' . $promo1['lname']); ?>">
                                                    <?php echo strtoupper($promo1['fname'] . ' ' . $promo1['lname'] . ' ( ' . $promo1['special_area'] . ' - ' . $promo1['institution'] . ' )'); ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-lg-12 col-md-12">
                                    <div class="form-group">
                                        <label for="assessor4">Select Assessor 4</label>
                                        <select class="d-block" style="width:100%;" name="assessor4" id="assessor4">
                                            <option value="">- Assessor 4 -</option>
                                            <?php foreach ($assessor as $promo1) : ?>
                                                <option class="text-uppercase" value="<?php echo strtoupper($promo1['fname'] . ' ' . $promo1['lname']); ?>">
                                                    <?php echo strtoupper($promo1['fname'] . ' ' . $promo1['lname'] . ' ( ' . $promo1['special_area'] . ' - ' . $promo1['institution'] . ' )'); ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-lg-12 col-md-12">
                                    <div class="form-group">
                                        <label for="assessor5">Select Assessor 5</label>
                                        <select class="d-block" style="width:100%;" name="assessor5" id="assessor5">
                                            <option value="">- Assessor 5 -</option>
                                            <?php foreach ($assessor as $promo1) : ?>
                                                <option class="text-uppercase" value="<?php echo strtoupper($promo1['fname'] . ' ' . $promo1['lname']); ?>">
                                                    <?php echo strtoupper($promo1['fname'] . ' ' . $promo1['lname'] . ' ( ' . $promo1['special_area'] . ' - ' . $promo1['institution'] . ' )'); ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-lg-12 col-md-12">
                                    <div class="form-group">
                                        <label for="assessor6">Select Assessor 6</label>
                                        <select class="d-block" style="width:100%;" name="assessor6" id="assessor6">
                                            <option value="">- Assessor 6 -</option>
                                            <?php foreach ($assessor as $promo1) : ?>
                                                <option class="text-uppercase" value="<?php echo strtoupper($promo1['fname'] . ' ' . $promo1['lname']); ?>">
                                                    <?php echo strtoupper($promo1['fname'] . ' ' . $promo1['lname'] . ' ( ' . $promo1['special_area'] . ' - ' . $promo1['institution'] . ' )'); ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div class="col-md-12 mb-5">
                            <button class="btn btn-primary btn-round btn-block" type="submit" name="submit" id="submit">Assign Assessor</button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    </div>

    <script>
        function closeModal() {
            jQuery('#status_modal').modal('hide');
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        }

        $('#status_modal').on('hidden.bs.modal', function() {
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        });

        function closeModal() {
            jQuery('#status_modal').modal('hide');
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        }

        $('#status_modal').on('hidden.bs.modal', function() {
            setTimeout(function() {
                jQuery('#status_modal').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        });

        function closeModal() {
            jQuery('#assign_assessor').modal('hide');
            setTimeout(function() {
                jQuery('#assign_assessor').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        }

        $('#assign_assessor').on('hidden.bs.modal', function() {
            setTimeout(function() {
                jQuery('#assign_assessor').remove();
                jQuery('.modal_backdrop').remove();
            }, 300);
        });

        $(document).ready(function() {
            $('.assessor_ass').on('submit', function(event) {
                event.preventDefault();
                if ($('#assessor1').val() == '') {
                    Swal.fire({
                        icon: 'error',
                        //   title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                        html: '<span class="text-danger">Please select at least one assessor</span>',
                        showConfirmButton: false,
                        imageUrl: '../../public/images/logo/logo.png',
                        imageWidth: 100,
                        imageHeight: 100,
                        imageAlt: 'Custom image',
                        width: 300,
                        timer: 3000
                    });
                } else {
                    Swal.fire({
                        icon: 'info',
                        html: '<span class="text-danger font-weight-bold"> Are you sure you want to assign this Assessor(s)?</span>',
                        showConfirmButton: true,
                        showCancelButton: true,
                        imageUrl: '../../public/images/logo/logo.png',
                        imageWidth: 100,
                        imageHeight: 100,
                        imageAlt: 'Custom image',
                        width: 500,
                        confirmButtonText: 'Yes!'
                    }).then(function(result) {
                        if (result.value) {
                            $.ajax({
                                url: "assessor_assign",
                                method: "POST",
                                data: $('.assessor_ass').serialize(),
                                success: function(data) {
                                    console.log(data);
                                    var response = JSON.parse(data);
                                    console.log(response.status);
                                    if (response.status == 'success') {
                                        Swal.fire({
                                            icon: 'success',
                                            title: 'Success!!!',
                                            html: '<span class="text-danger">' +
                                                response.message + '</span>',
                                            showConfirmButton: false,
                                            imageUrl: '../../public/images/logo/logo.png',
                                            imageWidth: 100,
                                            imageHeight: 100,
                                            imageAlt: 'Custom image',
                                            width: 300,
                                            timer: 3000
                                        }).then(function() {
                                            location.reload();
                                        });
                                        $('#sub_form').html(data);
                                    } else if (response.status == 'error') {
                                        Swal.fire({
                                            icon: 'error',
                                            //   title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                                            html: '<span class="text-danger">' +
                                                response.message + '</span>',
                                            showConfirmButton: false,
                                            imageUrl: '../../public/images/logo/logo.png',
                                            imageWidth: 100,
                                            imageHeight: 100,
                                            imageAlt: 'Custom image',
                                            width: 300,
                                            timer: 3000
                                        });
                                    }

                                }
                            });
                        }
                    });
                }

            });
        });
    </script>

<?php

});

$app->get('/download/:fid', function ($fid) use ($app) {
    require './config/db.php';
    $token = trim($app->request()->get('token'));
    $file = $fid;
    $file = "/var/www/html/staffportal.ucc.edu.gh/public/images/all_units_files/" . $file;
    if (file_exists($file)) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($file) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file));
        readfile($file);
        exit;
    }
    // die();
});

$app->get('/downloadup/:fid', function ($fid) use ($app) {
    require './config/db.php';
    $token = trim($app->request()->get('token'));
    $file = $fid;
    $file = "/var/www/html/staffportal.ucc.edu.gh/public/images/staff_doc/" . $file;
    if (file_exists($file)) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($file) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file));
        readfile($file);
        exit;
    }
    // die();
});

$app->post('/send_procurement', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    $file_type = ['image/jpg', 'image/png', 'image/jpeg', 'application/pdf'];
    // $r = $app->request();

    $staff_no = $_SESSION['user']['staff_no'];

    $unit_id = $_SESSION['user']['unit_id'];
    // $productid = $_POST['product_type'];
    $prod_cat = $_POST['prod_cat'];
    // $data1 = '';

    if ($_SESSION['headtype'] == 'ACADEMIC') {
        if ($_SESSION['uhead'] == '03') {
            //$parent_id = $_SESSION['user']['parent_id'];
            $stage = 1;
            $status = 1;
        } elseif ($_SESSION['uhead'] == '02') {
            $stage = 2;
            $status = 1;
        } elseif ($_SESSION['uhead'] == '01') {
            $stage = 3;
            $status = 1;
        } elseif ($_SESSION['uhead'] == '04') {
            $stage = 4;
            $status = 1;
        }
    } else {
        if ($_SESSION['uhead'] == '03') {
            $stage = 1;
            $status = 1;
        } elseif ($_SESSION['uhead'] == '02') {
            $stage = 3;
            $status = 1;
        } elseif ($_SESSION['uhead'] == '01') {
            $stage = 3;
            $status = 1;
        } elseif ($_SESSION['uhead'] == '04') {
            $stage = 4;
            $status = 1;
        }
    }

    if (!empty($_SESSION['order_no'])) {
        $orderno = $_SESSION['order_no'];
        // $orders = $db->query("SELECT * FROM procurement.request_breakdown where order_no = '{$orderno}'");
        $orderno = $_SESSION['order_no'];
        $pos_sql = $db->query("SELECT * FROM procurement.request where order_no = ${orderno} order by request_id desc limit 1");

        $data = [];
        if ($pos_sql->num_rows > 0) {
            while ($row = $pos_sql->fetch_assoc()) {
                $data[] = $row;
            }
        }
        // var_dump($data);die();
        $request_id = $data[0]['request_id'];
        $sql_req = "INSERT INTO procurement.request_breakdown(unit_id,staff_no,request_id,order_no,status,stage,stage_status,product_cat)";
        $sql_req .= "VALUES (${unit_id},${staff_no},${request_id},'${orderno}','0','$stage','1',${prod_cat})";
        $insreq = $db->query($sql_req);
        // var_dump($sql_req);die();
        if ($insreq) {
            $sql_reqlog = "INSERT INTO procurement.request_log(unit_id,request_id,staff_no,order_no,status,stage,stage_status,item_description, product_cat)";
            $sql_reqlog .= "VALUES (${unit_id},${request_id},${staff_no},'${orderno}','0','$stage','1','Applied For Procurement of Item(s)',${prod_cat})";
            $insreqlog = $db->query($sql_reqlog);
            if ($insreqlog) {
                $data1 = [
                    'status' => 'success',
                    'message' => 'Added successfully'
                ];
            } else {
                $data1 = [
                    'status' => 'error',
                    'message' => 'Error adding data try again'
                ];
            }
        }
    } else {
        $rn1 = rand(100000, 999909);
        $rn3 = time() + date("Z");
        $rn = $rn1 . $rn3;
        $order_no = $rn;
        $orderno = $order_no;
        $_SESSION['order_no'] = $orderno;
        $sql1 = "INSERT INTO procurement.request(unit_id,staff_no,order_no,status,stage,stage_status)";
        $sql1 .= "VALUES (${unit_id},${staff_no},'${orderno}','0','$stage','1')";
        $getr = $db->query($sql1);
        if ($getr) {
            $pos_sql = $db->query("SELECT * FROM procurement.request order by request_id desc limit 1");

            $data = [];
            if ($pos_sql->num_rows > 0) {
                while ($row = $pos_sql->fetch_assoc()) {
                    $data[] = $row;
                }
            }
            // var_dump($data);die();
            $request_id = $data[0]['request_id'];
            $sql_req = "INSERT INTO procurement.request_breakdown(unit_id,staff_no,request_id,order_no,status,stage,stage_status,product_cat)";
            $sql_req .= "VALUES (${unit_id},${staff_no},${request_id},'${orderno}','0','$stage','1',${prod_cat})";
            $insreq = $db->query($sql_req);
            if ($insreq) {
                $sql_reqlog = "INSERT INTO procurement.request_log(unit_id,request_id,staff_no,order_no,status,stage,stage_status,type,product_cat)";
                $sql_reqlog .= "VALUES (${unit_id},${request_id},${staff_no},'${orderno}','0','$stage','1','1',${prod_cat})";
                $insreqlog = $db->query($sql_reqlog);
                if ($insreqlog) {
                    $data1 = [
                        'status' => 'success',
                        'message' => 'Added successfully'
                    ];
                } else {
                    $data1 = [
                        'status' => 'error',
                        'message' => 'Error adding data try again'
                    ];
                }
            }
        }
        // $orders = $db->query("SELECT * FROM procurement.request_breakdown where order_no = '{$orderno}'");
    }

    echo json_encode($data1);
    // var_dump($_POST);die();
});

$app->post('/update_procurement', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    // var_dump($_POST);die();
    $file_type = ['image/jpg', 'image/png', 'image/jpeg', 'application/pdf'];
    // $r = $app->request();
    // $reqid = $_POST['procure_id'];
    $desc = $_POST['desc'];
    $quantity = $_POST['quantity'];
    $rbid = $_POST['rbid'];
    $u_price = $_POST['u_price'];
    $nocount =  count($rbid);
    $rid = $_POST['rid'];
    $staff_no = $_SESSION['user']['staff_no'];

    $unit_id = $_SESSION['user']['unit_id'];

    $orderno = $_SESSION['order_no'];


    // $quantity = 0;
    // $desc = 0;
    // $rbid = 0;

    if (!empty($_POST['save'])) {
        for ($i = 0; $i < $nocount; $i++) {
            $desc[$i];
            $quantity[$i];
            $rbid[$i];
            $u_price[$i];

            $pos_sql = $db->query("SELECT * FROM procurement.request_breakdown where id = $rbid[$i]");

            $data = [];
            if ($pos_sql->num_rows > 0) {
                while ($row = $pos_sql->fetch_assoc()) {
                    $data[] = $row;
                }
            }

            $request_id = $data[0]['request_id'];
            $product_id = $data[0]['product_id'];
            $item_desc = $data[0]['item_desc'];
            $quantityold = $data[0]['quantity'];
            $order_no = $data[0]['order_no'];

            // var_dump($desc[$i]);
            // var_dump($quantity[$i]);
            // die();
            if ($desc[$i] != $item_desc || $quantity[$i] != $quantityold) {

                $sql_reqlog = "UPDATE procurement.request_breakdown SET quantity = '$quantity[$i]', item_desc = '$desc[$i]',unit_price = '$u_price[$i]' where id=$rbid[$i]";
                // echo $sql_reqlog;die();
                $insreqlog1 = $db->query($sql_reqlog);
            } else {
                $insreqlog1 = false;
            }
        }
        // var_dump($insreqlog);
        if ($insreqlog1) {
            $data1 = [
                'status' => 'success',
                'message' => 'SAVED SUCCESSFULLY'
            ];
        } else {
            $data1 = [
                'status' => 'error',
                'message' => 'CHANGES SAVED ALREADY'
            ];
        }
    } else {
        for ($i = 0; $i < $nocount; $i++) {
            $desc[$i];
            $quantity[$i];
            $rbid[$i];
            $u_price[$i];

            $total = $quantity[$i] * $u_price[$i];

            // echo $total += $total;

            // die();


            $pos_sql = $db->query("SELECT * FROM procurement.request_breakdown where id = $rbid[$i]");

            $data = [];
            if ($pos_sql->num_rows > 0) {
                while ($row = $pos_sql->fetch_assoc()) {
                    $data[] = $row;
                }
            }

            $request_id = $data[0]['request_id'];
            // $product_id = $data[0]['product_id'];
            $item_desc = $data[0]['item_desc'];
            $quantityold = $data[0]['quantity'];
            $order_no = $data[0]['order_no'];

            // var_dump($desc[$i]);
            // var_dump($quantity[$i]);
            // die();
            // if ($desc[$i] != $item_desc || $quantity[$i] != $quantityold) { 
            $sql_reqlog = "UPDATE procurement.request_breakdown SET quantity = '$quantity[$i]', item_desc = '$desc[$i]', sub_date = current_timestamp, status = 1, unit_price = '$u_price[$i]', total_price = ${total} where id=$rbid[$i]";
            // echo $sql_reqlog;die();
            $insreqlog1 = $db->query($sql_reqlog);

            if ($insreqlog1) {
                $pos_sql = $db->query("SELECT sum(total_price) as sum_total FROM procurement.request_breakdown where request_id = $request_id");

                $data2 = [];
                if ($pos_sql->num_rows > 0) {
                    while ($row = $pos_sql->fetch_assoc()) {
                        $data2[] = $row;
                    }
                }

                $total_p = $data2[0]['sum_total'];

                if ($_SESSION['headtype'] == 'ACADEMIC') {
                    if ($_SESSION['uhead'] == '03') {
                        if ($total_p <= 5000) {
                            $stage = 4;
                        } else {
                            $stage = 4;
                        }
                        $status = 1;
                    } elseif ($_SESSION['uhead'] == '02') {
                        if ($total_p <= 10000) {
                            $stage = 4;
                        } else {
                            $stage = 4;
                        }
                        $status = 1;
                    } elseif ($_SESSION['uhead'] == '01') {
                        if ($total_p <= 15000) {
                            $stage = 4;
                        } else {
                            $stage = 4;
                        }
                        $status = 1;
                    } elseif ($_SESSION['uhead'] == '04') {
                        if ($total_p <= 150000) {
                            $stage = 4;
                        } else {
                            $stage = 4;
                        }
                        $status = 1;
                    }
                } else {
                    if ($_SESSION['uhead'] == '03') {
                        $stage = 4;
                        $status = 1;
                    } elseif ($_SESSION['uhead'] == '02') {
                        $stage = 4;
                        $status = 1;
                    } elseif ($_SESSION['uhead'] == '01') {
                        $stage = 4;
                        $status = 1;
                    } elseif ($_SESSION['uhead'] == '04') {
                        $stage = 4;
                        $status = 1;
                    }
                }
                // echo $status;
                // echo "<br>";
                //   echo $stage;die();
                $sql_reqlog = "UPDATE procurement.request_breakdown SET quantity = '$quantity[$i]', item_desc = '$desc[$i]', sub_date = current_timestamp, status = $status, unit_price = '$u_price[$i]', total_price = ${total}, stage_status = 1 where id=$rbid[$i]";
                // echo $sql_reqlog;die();
                $insreqlog4 = $db->query($sql_reqlog);

                if ($insreqlog4) {
                    $sql_reqlog = "UPDATE procurement.request SET status = $status, request_date = current_timestamp, total_price = $total_p, stage = $stage, stage_status = 1 where request_id=${rid}";
                    // var_dump($sql_reqlog);die();
                    $insreqlog2 = $db->query($sql_reqlog);



                    if ($insreqlog2) {
                        $sql_reqlog = "INSERT INTO procurement.request_log(unit_id,request_id,staff_no,order_no,status,stage,stage_status, comments, quantity, item_description,unit_price, total_price)";
                        $sql_reqlog .= "VALUES (${unit_id},${rid},${staff_no},'${orderno}','$status','$stage','1', 'Updated Item','$quantity[$i]', '$desc[$i]','$u_price[$i]', ${total})";
                        // echo $sql_reqlog;die();
                        $insreqlog3 = $db->query($sql_reqlog);
                    }
                }
            }


            // }
        }
        if ($insreqlog3) {
            unset($_SESSION['order_no']);
            $_SESSION['order_no'] = null;
            if ($_SESSION['headtype'] == 'ACADEMIC') {
                if ($_SESSION['uhead'] == '03') {
                    //$parent_id = $_SESSION['user']['parent_id'];
                    $short_name = $_SESSION['user']['short_name'];
                    $faculty_id = $_SESSION['user']['faculty_id'];
                    $pos_sql = $db->query("SELECT * from hr.unit as t1 
                 left join hr.staff as t2 on t1.unit_head = t2.staff_no  or t2.staff_no = t1.unit_subhead
                 where t2.id = '$faculty_id'");
                    if ($pos_sql->num_rows > 0) {
                        while ($row = $pos_sql->fetch_assoc()) {
                            $ps2[] = $row;
                        }
                        $phone = $ps2[0]['phone'];
                    }
                } elseif ($_SESSION['uhead'] == '02') {
                    $short_name = $_SESSION['user']['short_name'];
                    $college_id = $_SESSION['user']['college_id'];
                    $pos_sql = $db->query("SELECT * from hr.unit as t1 
                 left join hr.staff as t2 on t1.unit_head = t2.staff_no or t2.staff_no = t1.unit_subhead
                 where t2.id = '$college_id'");
                    if ($pos_sql->num_rows > 0) {
                        while ($row = $pos_sql->fetch_assoc()) {
                            $ps2[] = $row;
                        }
                        $phone = $ps2[0]['phone'];
                    }
                }
            } else {
                if ($_SESSION['uhead'] == '03') {
                    $parent_id = $_SESSION['user']['parent_id'];
                    $short_name = $_SESSION['user']['short_name'];
                    $pos_sql = $db->query("SELECT * from hr.unit as t1 
                left join hr.staff as t2 on t1.unit_head = t2.staff_no or t2.staff_no = t1.unit_subhead
                where t1.id = '$parent_id'");
                    if ($pos_sql->num_rows > 0) {
                        while ($row = $pos_sql->fetch_assoc()) {
                            $ps2[] = $row;
                        }
                        $phone = $ps2[0]['phone'];
                    }
                } elseif ($_SESSION['uhead'] == '02') {
                    $parent_id = $_SESSION['user']['parent_id'];
                    $pos_sql = $db->query("SELECT * FROM hr.staff AS t1 
             left join hr.unit as t2 on t1.unit_id = t2.id
             WHERE t2.type ='NON-ACADEMIC'");
                    if ($pos_sql->num_rows > 0) {
                        while ($row = $pos_sql->fetch_assoc()) {
                            $ps2[] = $row;
                        }
                        $phone = $ps2[0]['phone'];
                    }
                    // $phone = '0547268141';
                }
            }

            if (!empty($phone)) {
                // $phone = '0547268141';
                $message = 'You have a procurement request from ' . $short_name . ' awaiting your approval. Please login https://staffportal.ucc.edu.gh to approve.';
                $key = 'pgC2DPZTwdbe68qPkuo4G36bV';
                $sender_id = 'PROCUREMENT';
                $url = "http://clientlogin.bulksmsgh.com/smsapi?key=$key&to=$phone&msg=$message&sender_id=$sender_id";
                //$url="http://clientlogin.bulksmsgh.com/smsapi?key=d413ba965ae771f637de&to=233244665289&msg=ernest&sender_id=ucc"; 	 
                $cSession = curl_init();
                //step2
                curl_setopt($cSession, CURLOPT_URL, "$url");
                curl_setopt($cSession, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($cSession, CURLOPT_HEADER, false);
                //step3
                $result = curl_exec($cSession);
                //step4
                curl_close($cSession);
            }
            // var_dump($result);die();

            $data1 = [
                'status' => 'success',
                'message' => 'Request Submitted Successfully'
            ];
        } else {
            $data1 = [
                'status' => 'error',
                'message' => 'Error updating data try again'
            ];
        }
    }

    echo json_encode($data1);
    // var_dump($_POST);die();
});

$app->post('/update_procurementdd', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    // var_dump($_POST);die();
    $file_type = ['image/jpg', 'image/png', 'image/jpeg', 'application/pdf'];
    // $r = $app->request();
    // $reqid = $_POST['procure_id'];
    $desc = $_POST['desc'];
    $quantity = $_POST['quantity'];
    $rbid = $_POST['rbid'];
    $u_price = $_POST['u_price'];
    $t_price = $_POST['t_price'];
    if (!empty($_POST['unbudgeted_approve'])) {
        $unbudgeted_approve = $_POST['unbudgeted_approve'];
    } else {
        $unbudgeted_approve = 'Approve';
    }
    $nocount =  count($rbid);
    $rid = $_POST['rid'];
    $staff_no = $_SESSION['user']['staff_no'];

    $unit_id = $_SESSION['user']['unit_id'];

    // $orderno = $_SESSION['order_no'];


    // $quantity = 0;
    // $desc = 0;
    // $rbid = 0;
    for ($i = 0; $i < $nocount; $i++) {
        $desc[$i];
        $quantity[$i];
        $rbid[$i];
        $u_price[$i];
        $unbudgeted_approve[$i];

        $pos_sql = $db->query("SELECT * FROM procurement.request_breakdown where id = $rbid[$i]");

        $data = [];
        if ($pos_sql->num_rows > 0) {
            while ($row = $pos_sql->fetch_assoc()) {
                $data[] = $row;
            }
        }

        $request_id = $data[0]['request_id'];
        // $product_id = $data[0]['product_id'];
        $item_desc = $data[0]['item_desc'];
        $quantityold = $data[0]['quantity'];
        $order_no = $data[0]['order_no'];
        $unit_price = $data[0]['unit_price'];
        $total_price = $data[0]['total_price'];

        $total = $u_price[$i] * $quantity[$i];

        $sql_reqlog = "UPDATE procurement.request_breakdown SET quantity = '$quantity[$i]', item_desc = '$desc[$i]', sub_date = current_timestamp, status = 1, unit_price = '$u_price[$i]', total_price = ${total}, budget_status = '$unbudgeted_approve[$i]' where id=$rbid[$i]";
        // echo $sql_reqlog;die();
        $insreqlog1 = $db->query($sql_reqlog);

        if ($insreqlog1) {
            $pos_sql = $db->query("SELECT sum(total_price) as sum_total FROM procurement.request_breakdown where request_id = $request_id");

            $data2 = [];
            if ($pos_sql->num_rows > 0) {
                while ($row = $pos_sql->fetch_assoc()) {
                    $data2[] = $row;
                }
            }

            $total_p = $data2[0]['sum_total'];

            if ($_SESSION['headtype'] == 'ACADEMIC') {
                if ($_SESSION['uhead'] == '03') {
                    if ($total_p <= 5000) {
                        $stage = 4;
                    } else {
                        $stage = 1;
                    }
                    $status = 1;
                } elseif ($_SESSION['uhead'] == '02') {
                    if ($total_p <= 10000) {
                        $stage = 4;
                    } else {
                        $stage = 2;
                    }
                    $status = 2;
                } elseif ($_SESSION['uhead'] == '01') {
                    if ($total_p <= 15000) {
                        $stage = 4;
                    } else {
                        $stage = 3;
                    }
                    $status = 3;
                } elseif ($_SESSION['uhead'] == '04') {
                    if ($total_p <= 150000) {
                        $stage = 4;
                    } else {
                        $stage = 5;
                    }
                    $status = 4;
                }
            } else {
                if ($_SESSION['uhead'] == '03') {
                    $stage = 1;
                    $status = 1;
                } elseif ($_SESSION['uhead'] == '02') {
                    $stage = 2;
                    $status = 2;
                } elseif ($_SESSION['uhead'] == '01') {
                    $stage = 3;
                    $status = 3;
                } elseif ($_SESSION['uhead'] == '04') {
                    $stage = 4;
                    $status = 4;
                }
            }

            $sql_reqlog = "UPDATE procurement.request_breakdown SET quantity = '$quantity[$i]', item_desc = '$desc[$i]', sub_date = current_timestamp, status = '$status', unit_price = '$u_price[$i]', total_price = $total where id=$rbid[$i]";
            // echo $sql_reqlog;die();
            $insreqlog1 = $db->query($sql_reqlog);
            // var_dump($desc[$i]);
            // die();
            if ($desc[$i] != $item_desc || $quantity[$i] != $quantityold || $u_price[$i] != $unit_price) {

                $pos_sql = $db->query("SELECT sum(total_price) as sum_total FROM procurement.request_breakdown where request_id = $rid");

                $data2 = [];
                if ($pos_sql->num_rows > 0) {
                    while ($row = $pos_sql->fetch_assoc()) {
                        $data2[] = $row;
                    }
                }

                $total_p = $data2[0]['sum_total'];
                // echo "string";die();

                $sql_reqlog = "UPDATE procurement.request SET status = '$status', request_date = current_timestamp, total_price = $total_p where request_id=${rid}";
                // var_dump($sql_reqlog);die();
                $insreqlog2 = $db->query($sql_reqlog);

                if ($_SESSION['uhead'] == '01') {
                    # code...
                    $comments = $_SESSION['headtype'] == 'ACADEMIC' ? 'Provost Updated Item' : 'Registrar Updated Item';
                } elseif ($_SESSION['uhead'] == '02') {
                    # code...
                    $comments = $_SESSION['headtype'] == 'ACADEMIC' ? 'Dean Updated Item' : 'Director Updated Item';
                } elseif ($_SESSION['uhead'] == '04') {
                    # code...
                    $comments = 'VC Updated Item';
                }

                $sql_reqlog = "UPDATE procurement.request_breakdown SET quantity = '$quantity[$i]', item_desc = '$desc[$i]', sub_date = current_timestamp, status = '$status', unit_price = '$u_price[$i]', total_price = $total where id=$rbid[$i]";
                // echo $sql_reqlog;die();
                $insreqlog1 = $db->query($sql_reqlog);

                if ($insreqlog1 && $insreqlog2) {
                    $sql_reqlog = "INSERT INTO procurement.request_log(unit_id,request_id,staff_no,order_no,status,stage,stage_status, comments, quantity, item_description, unit_price, total_price)";
                    $sql_reqlog .= "VALUES (${unit_id},${rid},${staff_no},'${order_no}','$status','$stage','1', '${comments}','$quantity[$i]', '$desc[$i]','$u_price[$i]','$total')";
                    // echo $sql_reqlog;die();
                    $insreqlog = $db->query($sql_reqlog);
                }
            } else {
                $insreqlog = $insreqlog2 = $insreqlog1 = true;
            }
        }



        // var_dump($insreqlog);        
    }
    if ($insreqlog && $insreqlog2 && $insreqlog1) {
        // unset($_SESSION['order_no']);
        // $_SESSION['order_no'] = null;
        $data1 = [
            'status' => 'success',
            'message' => 'Update done successfully'
        ];
    } else {
        $data1 = [
            'status' => 'error',
            'message' => 'Error updating data try again'
        ];
    }

    echo json_encode($data1);
    // var_dump($_POST);die();
});

$app->post('/del_procurement', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    // var_dump($_POST);die();
    $file_type = ['image/jpg', 'image/png', 'image/jpeg', 'application/pdf'];
    // $r = $app->request();
    $reqid = $_POST['procure_id'];
    // $desc = $_POST['desc'];
    // $quantity = $_POST['quantity'];
    $staff_no = $_SESSION['user']['staff_no'];

    $unit_id = $_SESSION['user']['unit_id'];

    $all = explode(',', $reqid);
    $reqid = $all[0];
    $type = $all[1];



    $pos_sql = $db->query("SELECT * FROM procurement.request_breakdown where id = ${reqid}");

    $data = [];
    if ($pos_sql->num_rows > 0) {
        while ($row = $pos_sql->fetch_assoc()) {
            $data[] = $row;
        }
    }
    // var_dump($data);die();
    $request_id = $data[0]['request_id'];
    $product_id = $data[0]['product_id'];
    $item_desc = $data[0]['item_desc'];
    $quantityold = $data[0]['quantity'];
    if (!empty($_SESSION['order_no'])) {
        $orderno = $_SESSION['order_no'];
        $status = 0;
    } else {
        $orderno = $data[0]['order_no'];
        $status = 2;
    }


    if ($type == 1) {

        $sql_reqlog = "DELETE FROM procurement.request_breakdown where id=${reqid}";
        $insreqlog = $db->query($sql_reqlog);

        $sql_reqlog = "INSERT INTO procurement.request_log(unit_id,request_id,staff_no,order_no,status,stage,stage_status, comments)";
        $sql_reqlog .= "VALUES (${unit_id},${request_id},${staff_no},'${orderno}','${status}','1','1', 'Deleted This Item')";
        $insreqlog = $db->query($sql_reqlog);
        // var_dump($insreqlog);
        if ($insreqlog) {
            $data1 = [
                'status' => 'success',
                'message' => 'Deletion done successfully'
            ];
        } else {
            $data1 = [
                'status' => 'error',
                'message' => 'Error deleting data try again'
            ];
        }
    }

    echo json_encode($data1);
    // var_dump($_POST);die();
});

$app->post('/ghcard_update_script', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    //    var_dump($_POST);die();
    $staff_no = $_POST['staff_no'];
    $ghcard_no = $_POST['ghcard_no'];
    $sql = "UPDATE hr.staff set ghana_card_no = '$ghcard_no' where staff_no = $staff_no";
    $run = $db->query($sql);
    if ($run) {
        $app->flash('success', 'Ghana Card number loaded successful!');
    } else {
        $app->flash('error', 'Failed to update details!');
    }

    $app->redirect($app->urlFor('ghcard_update'));
});

$app->post('/counseling_script', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    // var_dump($_POST);die();
    $staff_no = $_POST['staff_no'];
    $c_type = $_POST['c_type'];
    $contact = $_POST['contact'];
    $email = strtoupper($_POST['email']);
    $delivery_mode = $_POST['delivery_mode'];
    $runtype = $_SESSION['user']['staff_group'];

    $pos_sql = $db->query("SELECT * FROM hrmscode.counselors_staff WHERE staff_id = '$staff_no' and council_needed = '$c_type' and status < 4");

    //  $data = [];
    if (!$pos_sql->num_rows) {
        $sql = "INSERT INTO hrmscode.counselors_staff(staff_id,phone_no,email,council_needed,runtype,delivery_mode) 
        VALUES('$staff_no','$contact','$email','$c_type','$runtype','$delivery_mode')";
        $run = $db->query($sql);
        if ($run) {
            $app->flash('success', 'Request Sent Successful !!!');
        } else {
            $app->flash('error', 'Failed to send request');
        }
    } else {
        $app->flash('error', 'You already sent a request');
    }

    $app->redirect($app->urlFor('counseling'));
});

$app->post('/updatecoun', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    // var_dump($_POST);die();

    $valofcoun = explode('_', $_POST['feedback']);
    $cid = $valofcoun[1];
    $feedback = $valofcoun[0];
    $sql = "UPDATE hrmscode.counselors_staff set feedback = '$feedback' WHERE id = '$cid'";
    $run = $db->query($sql);
    if ($run) {
        $data1 = [
            'status' => 'success',
            'message' => 'Update Done Successfully'
        ];
        // $app->flash('success','Request Sent Successful !!!');
    } else {
        $data1 = [
            'status' => 'error',
            'message' => 'Update not Done'
        ];
        // $app->flash('error','Failed to send request');
    }

    $app->redirect($app->urlFor('counseling'));
});

$app->post('/send_promo_sm', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    // $host = $app->host;
    $r = $app->request();
    //    echo 'la';die();
    // var_dump($_POST);
    // var_dump($_FILES);
    // die();
    $staff_no = $_SESSION['user']['staff_no'];
    $position_id = trim($r->post('position'));
    $comment = trim($r->post('comment'));
    $app_type = trim($r->post('apply_type'));
    $unit_id = $_SESSION['user']['unit_id'];
    $staff_group = $_SESSION['user']['staff_group'];
    $job_id = $_SESSION['user']['job_id'];
    $scale_id = '3';
    $stage = 'Waiting for acceptance';
    $promo_status = '1';
    $activity = '0';
    if ($app_type == 0) {
        $stage_activity = 'Applied for promotion';
        $comments = 'Submitted files for promotion';
    } else {
        $stage_activity = 'Applied for contract renewal';
        $comments = 'Submitted files for renewal of contract';
    }

    $user_id = $_SESSION['user']['staff_no'];

    $apply_type = trim($r->post('apply_type'));
    $dept = trim($r->post('dept'));
    $college = trim($r->post('college'));
    $email = trim($r->post('email'));
    $tel = trim($r->post('tel'));
    $present_rank = trim($r->post('present_rank'));
    $pr_edate = trim($r->post('pr_edate'));
    $present_rank_ifany = trim($r->post('present_rank_ifany'));
    $pp_edate = trim($r->post('pp_edate'));
    $first_degree_details = trim($r->post('first_degree_details'));
    $pg_degree_details = trim($r->post('pg_degree_details'));
    $prizes_grant_award = trim($r->post('prizes_grant_award'));
    $previous_post_duties = trim($r->post('previous_post_duties'));
    $teaching_duties_experience = trim($r->post('teaching_duties_experience'));
    $conference_seminars_etc = trim($r->post('conference_seminars_etc'));
    $publications_for_previous_promotion = trim($r->post('publications_for_previous_promotion'));
    $new_publication_submitted = trim($r->post('new_publication_submitted'));
    $professional_membership_bodies = trim($r->post('professional_membership_bodies'));
    $other_relevant_info = trim($r->post('other_relevant_info'));
    $sub_date = trim($r->post('sub_date'));
    $fullname = trim($r->post('fullname'));
    $staff_no = trim($r->post('staff_no'));
    $paper_num = trim($r->post('paper_num'));
    $paper_title = trim($r->post('paper_title'));
    $signature = trim($r->post('signature'));
    $app_letter = trim($r->post('app_letter'));
    $app_cv = trim($r->post('app_cv'));
    $papers = trim($r->post('papers'));
    $specialization = trim($r->post('specialization'));
    $other_qualification = trim($r->post('other_qualification'));
    $research_major_projects = trim($r->post('research_major_projects'));
    $delete_signature = !empty($r->post('delete_signature')) ? $r->post('delete_signature') : '';
    $delete_letter = !empty($r->post('delete_letter')) ? $r->post('delete_letter') : '';
    $delete_cv = !empty($r->post('delete_cv')) ? $r->post('delete_cv') : '';
    $delete_file = !empty($r->post('delete_file')) ? $r->post('delete_file') : '';


    $file_type = array("image/jpg", "image/png", "image/jpeg", "application/pdf");
    $file_type_img = array("image/jpg", "image/png", "image/jpeg");
    if (!empty($_FILES['signature']['name'])) {
        $files = $_FILES['signature']['name'];
        $tempfile = $_FILES['signature']['tmp_name'];
        $typefile = $_FILES['signature']['type'];
        $ftyp = explode('/', $typefile);
    } else {
        $signature = trim($r->post('signature'));
    }
    if (!empty($_FILES['app_letter']['name'])) {
        $files1 = $_FILES['app_letter']['name'];
        $tempfile1 = $_FILES['app_letter']['tmp_name'];
        $typefile1 = $_FILES['app_letter']['type'];
        $ftyp1 = explode('/', $typefile1);
    } else {
        $app_letter = trim($r->post('app_letter'));
    }
    if (!empty($_FILES['app_cv']['name'])) {
        $files2 = $_FILES['app_cv']['name'];
        $tempfile2 = $_FILES['app_cv']['tmp_name'];
        $typefile2 = $_FILES['app_cv']['type'];
        $ftyp2 = explode('/', $typefile2);
    } else {
        $app_cv = trim($r->post('app_cv'));
    }
    if (!empty($_FILES['papers']['name'])) {
        $files3 = $_FILES['papers']['name'];
        $tempfile3 = $_FILES['papers']['tmp_name'];
        $typefile3 = $_FILES['papers']['type'];
        $ftyp3 = explode('/', $typefile3);
    } else {
        $papers = trim($r->post('papers'));
    }

    $timestamp = time() + date("Z");
    $timetoday = gmdate("Ymd-His", $timestamp);

    // $checkpromo = "select * from staff_promotion where staff_no = ${staff_no} and promo_status != 7";
    $checkpromo = "select * from promotion_data where staff_no = ${staff_no} and status = 1";
    $run = $db->query($checkpromo);
    $rows = [];
    if ($run->num_rows > 0) {
        while ($row = $run->fetch_array()) {
            $rows[] = $row;
        }
    }
    //   var_dump($rows);
    //   echo 'update3'; die();

    if (count($rows) > 0) {
        // echo 'update1'; die();
        $data1 = [
            'status' => 'error',
            'message' => 'Application cannot be done twice'
        ];
    } else {
        // echo 'update3'; die();

        if (in_array(!empty($typefile), $file_type_img) && $tempfile != "") {
            $newfilePath = dirname(dirname(__FILE__)) . "/public/images/staff_doc/" . $timetoday . $_SESSION['user']['staff_no'] . '_sign.' . $ftyp[1];
            $file1 = move_uploaded_file($tempfile, $newfilePath);
            if ($file1) {
                $signature = "../../public/images/staff_doc/" . $timetoday . $_SESSION['user']['staff_no'] . '_sign.' . $ftyp[1];
            } else {
                $signature = trim($r->post('signature'));
            }
        } else {
            $signature = trim($r->post('signature'));

            // $data1 = [
            //     'status' => 'error',
            //     'message' => 'Signature image not available please upload new one'
            // ];
        }

        if (in_array(!empty($typefile1), $file_type) && $tempfile1 != "") {
            $newfilePath1 = dirname(dirname(__FILE__)) . "/public/images/staff_doc/" . $timetoday . $_SESSION['user']['staff_no'] . '_letter.' . $ftyp1[1];
            $file2 = move_uploaded_file($tempfile1, $newfilePath1);
            if ($file2) {
                $app_letter = $newfilePath1;
            } else {
                $app_letter = trim($r->post('app_letter'));
            }
        } else {
            $app_letter = trim($r->post('app_letter'));
            // $data1 = [
            //     'status' => 'error',
            //     'message' => 'Letter not available please upload new one'
            // ];
        }

        if (in_array(!empty($typefile2), $file_type) && $tempfile2 != "") {
            $newfilePath2 = dirname(dirname(__FILE__)) . "/public/images/staff_doc/" . $timetoday . $_SESSION['user']['staff_no'] . '_cv' . '.' . $ftyp2[1];
            $file3 = move_uploaded_file($tempfile2, $newfilePath2);
            if ($file3) {
                $app_cv = $newfilePath2;
            } else {
                $app_cv = trim($r->post('app_cv'));
            }
        } else {
            $app_cv = trim($r->post('app_cv'));
            // $data1 = [
            //     'status' => 'error',
            //     'message' => 'CV not available please upload new one'
            // ];
        }

        if (in_array(!empty($typefile3), $file_type) && $tempfile3 != "") {
            $newfilePath3 = dirname(dirname(__FILE__)) . "/public/images/staff_doc/" . $timetoday . $_SESSION['user']['staff_no'] . '_papers' . '.' . $ftyp3[1];
            $file3 = move_uploaded_file($tempfile3, $newfilePath3);
            if ($file3) {
                $papers = $newfilePath3;
            } else {
                $papers = trim($r->post('papers'));
            }
        } else {
            $papers = trim($r->post('papers'));
            // $data1 = [
            //     'status' => 'error',
            //     'message' => 'Paper not available please upload new one'
            // ];
        }


        if (isset($delete_signature) && !empty($delete_signature)) {
            $delete_signature = explode(',', $delete_signature);
            $signature = '';
        }
        if (isset($delete_letter) && !empty($delete_letter)) {
            $delete_letter = explode(',', $delete_letter);
            $app_letter = '';
        }
        if (isset($delete_cv) && !empty($delete_cv)) {
            $delete_cv = explode(',', $delete_cv);
            $app_cv = '';
        }
        if (isset($delete_file) && !empty($delete_file)) {
            $delete_file = explode(',', $delete_file);
            $papers = '';
        }

        if (!empty($delete_file[1])) {
            $fid = $delete_file[0];
            $sql_docs = "DELETE FROM promo_papers where id = '$fid'";
            $run1 = $db->query($sql_docs);
        }

        if ($r->post('save') == 'on') {
            // echo 'update2'; die();

            if (empty($signature)) {
                $data1 = [
                    'status' => 'error',
                    'message' => 'Please upload your signature'
                ];
            }
            if (empty($app_letter)) {
                $data1 = [
                    'status' => 'error',
                    'message' => 'Please upload your application letter'
                ];
            }
            if (empty($app_cv)) {
                $data1 = [
                    'status' => 'error',
                    'message' => 'Please upload your CV'
                ];
            }

            // if (empty($papers)) {
            //     $data1 = [
            //         'status' => 'error',
            //         'message' => 'Please upload your papers'
            //     ];
            // }
            if (empty($position_id)) {
                $data1 = [
                    'status' => 'error',
                    'message' => 'Please select your position'
                ];
            }

            $checkpromo = "select * from staff_promotion where staff_no = ${staff_no} and promo_status != 7";
            $run = $db->query($checkpromo);
            $rows = [];
            if ($run->num_rows > 0) {
                while ($row = $run->fetch_array()) {
                    $rows[] = $row;
                }
            }
            //   var_dump($rows);
            // echo 'update3';
            // die();

            if (count($rows) == 0) {
                $sql = "INSERT INTO staff_promotion(staff_no,position_id,promo_doc1,promo_doc2,apply_form,unit_id,staff_group,job_id,scale_id,stage,promo_status,type,promo_comments,app_letter)";
                $sql .= "VALUES (${staff_no},${position_id},'${app_cv}','${papers}','','${unit_id}','${staff_group}','${job_id}','${scale_id}','${stage}','${promo_status}','${app_type}','${comment}','$app_letter')";
                $run = $db->query($sql);
            } else {
                $ppaid = $rows[0]['promotion_id'];
                $sql = "UPDATE staff_promotion SET position_id = $position_id,promo_doc1 = '$app_cv',promo_doc2 = '$papers',apply_form = '',promo_comments = '$comment',app_letter = '$app_letter',promo_status = '$promo_status' where staff_no = $staff_no and promo_status != 7 and promotion_id = $ppaid";
                $run = $db->query($sql);
                // $run = true;
            }
            // echo $sql;
            // die();
            // $run = $db->query($sql);
            if ($run) {
                $pid1 = "SELECT MAX(promotion_id) AS promo_id FROM staff_promotion WHERE staff_no = $staff_no";
                $pid = $db->query($pid1);
                $rel = [];
                while ($row = $pid->fetch_assoc()) {
                    $rel[] = $row;
                }
                foreach ($rel as $iddata) {
                    $promo_id = $iddata['promo_id'];
                }
                $from = 'staffportal@ucc.edu.gh';
                // $to = 'richmond.nketia@ucc.edu.gh';
                $to = $email;
                $subject = 'Promotion Request';
                $body = '';
                $body .= '
                            <div align="center">
                                <div class="center" align="center">
                                    <div class="col-4">
                                <img src="/var/www/html/staffportal.ucc.edu.gh/public/images/ucclogo1.png" width="50" height="50" alt="UCC" class="light-logo" />
                                    </div>
                                    <div class="col-8">
                                        <h2 class="card-title text-uppercase">UNIVERSITY OF CAPE COAST</h2>
                                        <h1 class="card-title text-uppercase">STAFF PORTAL</h1>
                                    </div>
                                </div>
                                <p>You have a promotion request awaiting your approval. Please login to https://staffportal.ucc.edu.gh and attend to it.</p>                            
                            </div>
                            ';
                $sql1 = "INSERT INTO promo_activities(unit_id,user_id,promotion_id,stage_activity,comments,promo_status,activity,type)";
                $sql1 .= "VALUES (${unit_id},${user_id},${promo_id},'${stage_activity}','${comments}','${promo_status}','${activity}','${app_type}')";
                $getr = $db->query($sql1);


                $pos_sql = $db->query("SELECT * FROM promotion_data where staff_no = '$staff_no' and status = 0");

                $data = [];
                if ($pos_sql->num_rows > 0) {
                    // while($row = $pos_sql->fetch_assoc()){
                    // $data[] = $row;
                    // } update
                    // echo 'update2';
                    // die();
                    $sql = "UPDATE promotion_data SET promo_id = '$promo_id', apply_type = '$apply_type', dept = '$dept', college = '$college', email = '$email', tel = '$tel', 
                        present_rank = '$present_rank', pr_edate = '$pr_edate', present_rank_ifany = '$present_rank_ifany', pp_edate = '$pp_edate', 
                        first_degree_details = '$first_degree_details', pg_degree_details = '$pg_degree_details', prizes_grant_award = '$prizes_grant_award',
                        previous_post_duties = '$previous_post_duties', teaching_duties_experience = '$teaching_duties_experience', 
                        conference_seminars_etc = '$conference_seminars_etc', publications_for_previous_promotion = '$publications_for_previous_promotion', 
                        new_publication_submitted = '$new_publication_submitted', professional_membership_bodies = '$professional_membership_bodies', 
                        other_relevant_info = '$other_relevant_info', sub_date = '$sub_date', fullname = '$fullname', staff_no = '$staff_no', other_qualification = '$other_qualification', promo_comments = '$comment',
                        paper_title = '$paper_title', area_specialization = '$specialization', research_major_projects = '$research_major_projects', signature = '$signature', app_letter = '$app_letter', app_cv = '$app_cv', papers = '$papers', status = '1' 
                        where staff_no = '$staff_no' and status = 0";
                    // echo $sql;
                    // die();

                    $run = $db->query($sql);

                    if (!empty($papers)) {
                        $sql_docs = "INSERT INTO promo_papers(staff_no, promo_id, title, file, unique_num)
                            VALUES('$staff_no','$promo_id','$paper_title','$papers', '$paper_num')";
                        $run1 = $db->query($sql_docs);
                        if ($run1) {
                            $sql = "INSERT INTO promo_apply_log(staff_no,promo_id,activity_done)";
                            $sql .= "VALUES (${staff_no},${promo_id},'Updated promotion data')";
                            $run = $db->query($sql);
                            $data1 = [
                                'status' => 'success',
                                'message' => 'Application Saved successfully'
                            ];
                        }
                    } else {
                        if ($run) {
                            $sql_docs_up = "UPDATE promo_papers set status = 1 where promo_id = '$promo_id'";
                            $run2 = $db->query($sql_docs_up);
                            if ($run2) {
                                $sql = "INSERT INTO promo_apply_log(staff_no,promo_id,activity_done)";
                                $sql .= "VALUES (${staff_no},${promo_id},'Updated promotion data')";
                                $run = $db->query($sql);
                                $data1 = [
                                    'status' => 'success',
                                    'message' => 'Application Saved successfully'
                                ];
                            }
                        }
                    }
                } else {
                    // echo 'insert2';
                    // die();
                    $sql = "INSERT INTO promotion_data(apply_type,dept,college,email,tel,present_rank,pr_edate,present_rank_ifany,pp_edate,first_degree_details,
                        pg_degree_details,prizes_grant_award,previous_post_duties,teaching_duties_experience,conference_seminars_etc,
                        publications_for_previous_promotion,new_publication_submitted,professional_membership_bodies,other_relevant_info,sub_date,
                        fullname,staff_no,paper_title,signature,app_letter,app_cv,papers,promo_id,status, area_specialization, research_major_projects, other_qualification, promo_comments) 
                        VALUES('$apply_type','$dept','$college','$email','$tel','$present_rank','$pr_edate','$present_rank_ifany','$pp_edate',
                        '$first_degree_details','$pg_degree_details','$prizes_grant_award','$previous_post_duties','$teaching_duties_experience',
                        '$conference_seminars_etc','$publications_for_previous_promotion','$new_publication_submitted','$professional_membership_bodies',
                        '$other_relevant_info','$sub_date','$fullname','$staff_no','$paper_title','$signature','$app_letter','$app_cv','$papers','$promo_id','1','$specialization', '$research_major_projects', '$other_qualification', '$comment')";
                    // echo $sql;die();

                    $run = $db->query($sql);

                    if (!empty($papers)) {
                        $sql_docs = "INSERT INTO promo_papers(staff_no, promo_id, title, file, unique_num) 
                            VALUES('$staff_no','$promo_id','$paper_title','$papers', '$paper_num')";
                        $run1 = $db->query($sql_docs);
                        if ($run) {
                            $data1 = [
                                'status' => 'success',
                                'message' => 'Application Saved successfully'
                            ];
                        }
                    } else {
                        if ($run) {
                            $sql_docs_up = "UPDATE promo_papers set status = 1 where promo_id = '$promo_id'";
                            $run2 = $db->query($sql_docs_up);
                            if ($run2) {
                                $sql = "INSERT INTO promo_apply_log(staff_no,promo_id,activity_done)";
                                $sql .= "VALUES (${staff_no},${promo_id},'Inserted new promotion data')";
                                $run = $db->query($sql);
                                $data1 = [
                                    'status' => 'success',
                                    'message' => 'Application Saved successfully'
                                ];
                            }
                        }
                    }
                }
            }
        } else {
            $promo_status = '0';

            // echo 'update'; die();
            $checkpromo = "select * from staff_promotion where staff_no = ${staff_no} and promo_status != 7";
            $run = $db->query($checkpromo);
            $rows = [];
            if ($run->num_rows > 0) {
                while ($row = $run->fetch_array()) {
                    $rows[] = $row;
                }
            }
            //   var_dump($rows);
            //   echo 'update3'; die();

            // if (count($rows) == 0) {
            //     $sql = "INSERT INTO staff_promotion(staff_no,position_id,promo_doc1,promo_doc2,apply_form,unit_id,staff_group,job_id,scale_id,stage,promo_status,type,promo_comments)";
            //     $sql .= "VALUES (${staff_no},${position_id},'${app_cv}','${papers}','${app_letter}','${unit_id}','${staff_group}','${job_id}','${scale_id}','${stage}','${promo_status}','${app_type}','${comment}')";
            //     $run = $db->query($sql);
            // } else {
            //     $run = true;
            // }
            if (count($rows) == 0) {
                $sql = "INSERT INTO staff_promotion(staff_no,position_id,promo_doc1,promo_doc2,apply_form,unit_id,staff_group,job_id,scale_id,stage,promo_status,type,promo_comments,app_letter)";
                $sql .= "VALUES (${staff_no},${position_id},'${app_cv}','${papers}','','${unit_id}','${staff_group}','${job_id}','${scale_id}','${stage}','${promo_status}','${app_type}','${comment}','$app_letter')";
                $run = $db->query($sql);
            } else {
                $ppaid = $rows[0]['promotion_id'];
                $sql = "UPDATE staff_promotion SET position_id = $position_id,promo_doc1 = '$app_cv',promo_doc2 = '$papers',apply_form = '',promo_comments = '$comment', promo_status = '$promo_status',app_letter = '$app_letter' where staff_no = ${staff_no} and promo_status != 7 and promotion_id = $ppaid";
                $run = $db->query($sql);
                // $run = true;
            }

            // echo $sql;die();
            if ($run) {
                $pid1 = "SELECT MAX(promotion_id) AS promo_id FROM staff_promotion WHERE staff_no = $staff_no";
                $pid = $db->query($pid1);
                $rel = [];
                while ($row = $pid->fetch_assoc()) {
                    $rel[] = $row;
                }
                foreach ($rel as $iddata) {
                    $promo_id = $iddata['promo_id'];
                }



                $pos_sql = $db->query("SELECT * FROM promotion_data where staff_no = '$staff_no' and status = 0");
                $data = [];
                if ($pos_sql->num_rows > 0) {
                    // while($row = $pos_sql->fetch_assoc()){
                    // $data[] = $row;
                    // } update
                    // echo 'update1';
                    // die();
                    $sql = "UPDATE promotion_data SET promo_id = '$promo_id', apply_type = '$apply_type', dept = '$dept', college = '$college', email = '$email', tel = '$tel', 
                    present_rank = '$present_rank', pr_edate = '$pr_edate', present_rank_ifany = '$present_rank_ifany', pp_edate = '$pp_edate', 
                    first_degree_details = '$first_degree_details', pg_degree_details = '$pg_degree_details', prizes_grant_award = '$prizes_grant_award', 
                    previous_post_duties = '$previous_post_duties', teaching_duties_experience = '$teaching_duties_experience', 
                    conference_seminars_etc = '$conference_seminars_etc', publications_for_previous_promotion = '$publications_for_previous_promotion', 
                    new_publication_submitted = '$new_publication_submitted', professional_membership_bodies = '$professional_membership_bodies', 
                    other_relevant_info = '$other_relevant_info', sub_date = '$sub_date', fullname = '$fullname', staff_no = '$staff_no', promo_comments = '$comment',
                    paper_title = '$paper_title', area_specialization = '$specialization', research_major_projects = '$research_major_projects', signature = '$signature', app_letter = '$app_letter', app_cv = '$app_cv', other_qualification = '$other_qualification', papers = '$papers' 
                    where staff_no = '$staff_no' and status = 0";
                    // echo $sql;
                    // die();

                    $run = $db->query($sql);

                    if (!empty($papers)) {
                        $sql_docs = "INSERT INTO promo_papers(staff_no, promo_id, title, file, unique_num) 
                        VALUES('$staff_no','$promo_id','$paper_title','$papers', '$paper_num')";
                        $run1 = $db->query($sql_docs);
                        if ($run) {
                            $sql = "INSERT INTO promo_apply_log(staff_no,promo_id,activity_done)";
                            $sql .= "VALUES (${staff_no},${promo_id},'Updated promotion data')";
                            $run = $db->query($sql);
                            $data1 = [
                                'status' => 'success',
                                'message' => 'Application Submitted successfully'
                            ];
                        }
                    } else {
                        if ($run) {
                            $sql = "INSERT INTO promo_apply_log(staff_no,promo_id,activity_done)";
                            $sql .= "VALUES (${staff_no},${promo_id},'Updated promotion data')";
                            $run = $db->query($sql);
                            $data1 = [
                                'status' => 'success',
                                'message' => 'Application Submitted successfully'
                            ];
                        }
                    }
                } else {
                    // echo 'insert1';
                    // die();
                    $sql = "INSERT INTO promotion_data(apply_type, dept, college, email, tel, present_rank, pr_edate, present_rank_ifany, pp_edate, 
                    first_degree_details, pg_degree_details, prizes_grant_award, previous_post_duties, teaching_duties_experience, conference_seminars_etc, 
                    publications_for_previous_promotion, new_publication_submitted, professional_membership_bodies, other_relevant_info, sub_date, 
                    fullname, staff_no, paper_title, signature, app_letter, app_cv, papers, promo_id, area_specialization, research_major_projects, other_qualification, promo_comments) 
                    VALUES('$apply_type','$dept','$college','$email','$tel','$present_rank','$pr_edate','$present_rank_ifany','$pp_edate',
                    '$first_degree_details','$pg_degree_details','$prizes_grant_award','$previous_post_duties','$teaching_duties_experience',
                    '$conference_seminars_etc','$publications_for_previous_promotion','$new_publication_submitted','$professional_membership_bodies',
                    '$other_relevant_info','$sub_date','$fullname','$staff_no','$paper_title','$signature','$app_letter','$app_cv','$papers', '$promo_id','$specialization','$research_major_projects','$other_qualification','$comment')";
                    // echo $sql;die();
                    $run = $db->query($sql);

                    if (!empty($papers)) {
                        $sql_docs = "INSERT INTO promo_papers(staff_no, promo_id, title, file, unique_num) 
                        VALUES('$staff_no','$promo_id','$paper_title','$papers', paper_num)";
                        $run1 = $db->query($sql_docs);
                        if ($run) {
                            $sql = "INSERT INTO promo_apply_log(staff_no,promo_id,activity_done)";
                            $sql .= "VALUES (${staff_no},${promo_id},'Submitted new promotion data')";
                            $run = $db->query($sql);
                            $data1 = [
                                'status' => 'success',
                                'message' => 'Application Submitted successfully'
                            ];
                        }
                    } else {
                        if ($run) {
                            $sql = "INSERT INTO promo_apply_log(staff_no,promo_id,activity_done)";
                            $sql .= "VALUES (${staff_no},${promo_id},'Submitted new promotion data')";
                            $run = $db->query($sql);
                            $data1 = [
                                'status' => 'success',
                                'message' => 'Application Submitted successfully'
                            ];
                        }
                    }
                }
                // echo 'pal';
            }

            // echo 'pal1';
        }
    }

    echo json_encode($data1);

    die();
});

$app->post('/send_promo', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    $file_type = array("image/jpg", "image/png", "image/jpeg", "application/pdf");
    $r = $app->request();
    $files = $_FILES['input-folder-3']['name'];
    $tempfile = $_FILES['input-folder-3']['tmp_name'];
    $typefile = $_FILES['input-folder-3']['type'];
    $ftyp = explode('/', $typefile);
    $files1 = $_FILES['input-folder-4']['name'];
    $tempfile1 = $_FILES['input-folder-4']['tmp_name'];
    $typefile1 = $_FILES['input-folder-4']['type'];
    $ftyp1 = explode('/', $typefile1);
    $files2 = $_FILES['input-folder-1']['name'];
    $tempfile2 = $_FILES['input-folder-1']['tmp_name'];
    $typefile2 = $_FILES['input-folder-1']['type'];
    $ftyp2 = explode('/', $typefile2);
    $timestamp = time() + date("Z");
    $timetoday = gmdate("Ymd-His", $timestamp);
    if (empty($files)) {
        $data1 = [
            'status' => 'error',
            'message' => 'Please upload your CV'
        ];
    }
    if (empty($files1)) {
        $data1 = [
            'status' => 'error',
            'message' => 'Please upload your papers'
        ];
    }
    if (empty($files2)) {
        $data1 = [
            'status' => 'error',
            'message' => 'Please upload your papers'
        ];
    }
    if ((!in_array(!empty($typefile), $file_type)) || (!in_array(!empty($typefile1), $file_type)) || (!in_array(!empty($typefile2), $file_type))) {
        $data1 = [
            'status' => 'error',
            'message' => 'File format not supported please upload a new file(.pdf)'
        ];
    }
    if (in_array(!empty($typefile), $file_type) && in_array(!empty($typefile1), $file_type) || in_array(!empty($typefile2), $file_type)) {
        if ($tempfile != "" && $tempfile1 != "" && $tempfile2 != "") {
            $newfilePath = dirname(dirname(__FILE__)) . "/public/images/staff_doc/" . $timetoday . $_SESSION['user']['staff_no'] . '_cv.' . $ftyp[1];
            //   $newfilePathh = "/public/images/staff_doc/".$timetoday.$files[0];
            $newfilePath1 = dirname(dirname(__FILE__)) . "/public/images/staff_doc/" . $timetoday . $_SESSION['user']['staff_no'] . '_papers.' . $ftyp1[1];
            $newfilePath3 = dirname(dirname(__FILE__)) . "/public/images/staff_doc/" . $timetoday . $_SESSION['user']['staff_no'] . '_form' . '.' . $ftyp2[1];
            //   $newfilePath11 = "/public/images/staff_doc/".$timetoday.$files[1];
            $file1 = move_uploaded_file($tempfile, $newfilePath);
            $file2 = move_uploaded_file($tempfile1, $newfilePath1);
            $file2 = move_uploaded_file($tempfile2, $newfilePath3);
            //   echo $newfilePath1;
            //   die();
            $newfilePath2 = $newfilePath . ',' . $newfilePath1 . ',' . $newfilePath3;
            if ($file1) {
                $newfilePath2;
            }
        } else {
            $newfilePath = "";
            //   echo $newfilePath;
        }
    } else {
        $newfilePath = "";
        //  echo $newfilePath;
    }

    if (!empty($newfilePath2)) {
        $fileurl = explode(',', $newfilePath2);
        if (empty($fileurl[0])) {
            $data1 = [
                'status' => 'error',
                'message' => 'Please upload your CV'
            ];
        }
        if (empty($fileurl[1])) {
            $data1 = [
                'status' => 'error',
                'message' => 'Please upload your papers'
            ];
        }
        if (empty($fileurl[2])) {
            $data1 = [
                'status' => 'error',
                'message' => 'Please upload your papers'
            ];
        }
        if (!empty($fileurl[0]) || !empty($fileurl[1]) || !empty($fileurl[2])) {

            // $data = [

            $staff_no = $_SESSION['user']['staff_no'];
            $position_id = trim($r->post('position'));
            $comment = trim($r->post('comment'));
            $app_type = trim($r->post('apply_type'));
            $promo_doc1 = $fileurl[0];
            $promo_doc2 = $fileurl[1];
            $promo_doc3 = $fileurl[2];
            $unit_id = $_SESSION['user']['unit_id'];
            $staff_group = $_SESSION['user']['staff_group'];
            $job_id = $_SESSION['user']['job_id'];
            $scale_id = '3';
            $stage = 'Waiting for acceptance';
            $promo_status = '1';
            $activity = '0';
            if ($app_type == 0) {
                $stage_activity = 'Applied for promotion';
                $comments = 'Submitted files for promotion';
            } else {
                $stage_activity = 'Applied for contract renewal';
                $comments = 'Submitted files for renewal of contract';
            }

            $user_id = $_SESSION['user']['staff_no'];
            // ];


            if (empty($position_id)) {
                $data1 = [
                    'status' => 'error',
                    'message' => 'Please select your position'
                ];
            } elseif (empty($_FILES)) {
                $data1 = [
                    'status' => 'error',
                    'message' => 'Please select a file'
                ];
            } elseif (empty($newfilePath)) {
                $data1 = [
                    'status' => 'error',
                    'message' => 'File format should be an image or a pdf'
                ];
            } else {
                $checkpromo = "select * from staff_promotion where staff_no = ${staff_no} and promo_status != 7";
                $run = $db->query($checkpromo);
                $rows = [];
                if ($run->num_rows > 0) {
                    while ($row = $run->fetch_array()) {
                        $rows[] = $row;
                    }
                }
                if (count($rows) > 0) {
                    $data1 = [
                        'status' => 'error',
                        'message' => 'Application cannot be done twice'
                    ];
                } else {
                    if (!empty($position_id) && !empty($_FILES) && !empty($newfilePath)) {
                        $sql = "INSERT INTO staff_promotion(staff_no,position_id,promo_doc1,promo_doc2,apply_form,unit_id,staff_group,job_id,scale_id,stage,promo_status,type,promo_comments)";
                        $sql .= "VALUES (${staff_no},${position_id},'${promo_doc1}','${promo_doc2}','${promo_doc3}','${unit_id}','${staff_group}','${job_id}','${scale_id}','${stage}','${promo_status}','${app_type}','${comment}')";
                        // echo $sql;die();
                        $run = $db->query($sql);
                        if ($run) {
                            $pid1 = "SELECT MAX(promotion_id) AS promo_id FROM staff_promotion WHERE staff_no = $staff_no";
                            $pid = $db->query($pid1);
                            $rel = [];
                            while ($row = $pid->fetch_assoc()) {
                                $rel[] = $row;
                            }
                            foreach ($rel as $iddata) {
                                $promo_id = $iddata['promo_id'];
                            }
                            $from = 'staffportal@ucc.edu.gh';
                            // $to = 'richmond.nketia@ucc.edu.gh';
                            $to = $ucc_mail;
                            $subject = 'Promotion Request';
                            $body = '';
                            $body .= '
                    <div align="center">
                        <div class="center" align="center">
                            <div class="col-4">
                        <img src="/var/www/html/staffportal.ucc.edu.gh/public/images/ucclogo1.png" width="50" height="50" alt="UCC" class="light-logo" />
                            </div>
                            <div class="col-8">
                                <h2 class="card-title text-uppercase">UNIVERSITY OF CAPE COAST</h2>
                                <h1 class="card-title text-uppercase">STAFF PORTAL</h1>
                            </div>
                        </div>
                        <p>You have a promotion request awaiting your approval. Please login to https://staffportal.ucc.edu.gh and attend to it.</p>                            
                    </div>
                    ';
                            $sql1 = "INSERT INTO promo_activities(unit_id,user_id,promotion_id,stage_activity,comments,promo_status,activity,type)";
                            $sql1 .= "VALUES (${unit_id},${user_id},${promo_id},'${stage_activity}','${comments}','${promo_status}','${activity}','${app_type}')";
                            $getr = $db->query($sql1);
                            if ($getr) {
                                $udata = "SELECT t2.title, t2.fname, t2.phone, t2.ucc_mail FROM hr.unit as t1 left join hr.staff as t2 on t1.unit_head = t2.staff_no WHERE t1.id = $unit_id";
                                $udata = $db->query($udata);
                                $rel2 = [];
                                while ($row1 = $udata->fetch_assoc()) {
                                    $rel2[] = $row1;
                                }
                                foreach ($rel2 as $st_iddata) {
                                    $phone = $st_iddata['phone'];
                                    $ucc_mail = $st_iddata['ucc_mail'];
                                }

                                if (!empty($ucc_mail)) {
                                    $post_data = array(
                                        "From" => $from,
                                        "To" => $to,
                                        "Subject" => $subject,
                                        "HtmlBody" => $body,
                                        "MessageStream" => "outbound"
                                    );
                                    $curl = curl_init();
                                    curl_setopt_array($curl, array(
                                        CURLOPT_URL => 'https://api.postmarkapp.com/email',
                                        CURLOPT_SSL_VERIFYPEER => false,
                                        CURLOPT_RETURNTRANSFER => true,
                                        CURLOPT_ENCODING => "",
                                        CURLOPT_MAXREDIRS => 10,
                                        CURLOPT_TIMEOUT => 30,
                                        // CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                                        CURLOPT_CUSTOMREQUEST => 'POST',
                                        CURLOPT_POSTFIELDS => json_encode($post_data),
                                        CURLOPT_HTTPHEADER => array(
                                            "Accept: application/json",
                                            "Content-Type: application/json",
                                            "X-Postmark-Server-Token: 4fac9f37-7a49-4186-8f32-8022b9f43cc4",
                                        )
                                    ));

                                    // $response = curl_exec($curl);
                                    // $err = curl_error($curl);
                                    curl_close($curl);
                                    // return $response ? true :$err;
                                }

                                if (!empty($phone)) {
                                    //  $phone = '0547268141';
                                    $message = 'You have a promotion request awaiting your approval. Please login to https://staffportal.ucc.edu.gh and attend to it.';
                                    $key = 'pgC2DPZTwdbe68qPkuo4G36bV';
                                    $sender_id = 'UCC';
                                    $url = "http://clientlogin.bulksmsgh.com/smsapi?key=$key&to=$phone&msg=$message&sender_id=$sender_id";
                                    //$url="http://clientlogin.bulksmsgh.com/smsapi?key=d413ba965ae771f637de&to=233244665289&msg=ernest&sender_id=ucc"; 	 
                                    $cSession = curl_init();
                                    //step2
                                    curl_setopt($cSession, CURLOPT_URL, "$url");
                                    curl_setopt($cSession, CURLOPT_RETURNTRANSFER, true);
                                    curl_setopt($cSession, CURLOPT_HEADER, false);
                                    //step3
                                    $result = curl_exec($cSession);
                                    //step4
                                    curl_close($cSession);
                                }

                                $data1 = [
                                    'status' => 'success',
                                    'message' => 'Application has been submitted successfully'
                                ];
                            }
                        }
                    } else {
                        die('Something went wrong.');
                    }
                }
            }
        }
    }
    echo json_encode($data1);
});

$app->post('/send_tnd', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    $r = $app->request();
    // var_dump($_POST);
    // die();
    // $data = [
    $staff_no = $_SESSION['user']['staff_no'];
    $high_edu = trim($r->post('high_edu'));
    $study_leave = trim($r->post('study_leave'));
    $int_prog = trim($r->post('int_prog'));
    $study_place = trim($r->post('study_place'));
    $date_commence = trim($r->post('date_commence'));
    $prog_duration = trim($r->post('prog_duration'));
    $prog_type = trim($r->post('prog_type'));
    $study_mode = trim($r->post('study_mode'));
    $sponsor_kind = trim($r->post('sponsor_kind'));
    $other_scholarship = trim($r->post('other_scholarship'));
    $prog_relevance = trim($r->post('prog_relevance'));
    $signed = trim($r->post('signed'));
    $sub_date = trim($r->post('sub_date'));
    $save = trim($r->post('save'));
    // ];
    if ($save == 'on') {
        $sno = $_SESSION['user']['staff_no'];
        $pos_sql = $db->query("select * from study_intention where staff_no = $sno and appstatus = 0");
        if ($pos_sql->num_rows > 0) {
            while ($row = $pos_sql->fetch_assoc()) {
                $data1[] = $row;
            }
        }
        // var_dump($data1[0]['id']);die();
        if (empty($data1)) {
            $sql = "INSERT INTO study_intention(
            staff_no,
            high_edu,
            study_leave,
            int_prog,
            study_place,
            date_commence,
            prog_duration,
            prog_type,
            study_mode,
            sponsor_kind,
            other_scholarship,
            prog_relevance,
            signed,
            sub_date
         )";
            $sql .= "VALUES (
            '${staff_no}',
            '${high_edu}',
            '${study_leave}',
            '${int_prog}',
            '${study_place}',
            '${date_commence}',
            '${prog_duration}',
            '${prog_type}',
            '${study_mode}',
            '${sponsor_kind}',
            '${other_scholarship}',
            '${prog_relevance}',
            '${signed}',
            '${sub_date}')";

            $sub_a = $db->query($sql);
        } else {
            $apid = $data1[0]['id'];
            $sql = "update study_intention set
            staff_no = '${staff_no}',
            high_edu = '${high_edu}',
            study_leave = '${study_leave}',
            int_prog = '${int_prog}',
            study_place = '${study_place}',
            date_commence = '${date_commence}',
            prog_duration = '${prog_duration}',
            prog_type = '${prog_type}',
            study_mode = '${study_mode}',
            sponsor_kind = '${sponsor_kind}',
            other_scholarship = '${other_scholarship}',
            prog_relevance = '${prog_relevance}',
            signed = '${signed}',
            sub_date = '${sub_date}' where id = '${apid}'";

            $sub_a = $db->query($sql);
        }

        if ($sub_a) {
            $data1 = [
                'status' => 'success',
                'message' => 'Declaration of intention application have been updated successfully'
            ];
        } else {
            $data1 = [
                'status' => 'error',
                'message' => 'Error updating data refresh and try again'
            ];
        }
    } else {
        if (empty($high_edu)) {
            $data1 = [
                'status' => 'error',
                'message' => 'Enter your Highest Educational Qualification/Programme'
            ];
        } elseif (empty($study_leave)) {
            $data1 = [
                'status' => 'error',
                'message' => 'Enter the Last time study leave was granted'
            ];
        } elseif (empty($int_prog)) {
            $data1 = [
                'status' => 'error',
                'message' => 'Enter the Intended programme of study'
            ];
        } elseif (empty($study_place)) {
            $data1 = [
                'status' => 'error',
                'message' => 'Enter the Intended place of study'
            ];
        } elseif (empty($date_commence)) {
            $data1 = [
                'status' => 'error',
                'message' => 'Enter the Date of commencement of programme'
            ];
        } elseif (empty($prog_duration)) {
            $data1 = [
                'status' => 'error',
                'message' => 'Enter the Duration of programme(Years)'
            ];
        } elseif (empty($prog_type)) {
            $data1 = [
                'status' => 'error',
                'message' => 'Enter the Type of Programme'
            ];
        } elseif (empty($study_mode)) {
            $data1 = [
                'status' => 'error',
                'message' => 'Enter the Mode of Study'
            ];
        } elseif (empty($sponsor_kind)) {
            $data1 = [
                'status' => 'error',
                'message' => 'Enter the Kind of sponsorship required'
            ];
        } elseif (empty($other_scholarship)) {
            $data1 = [
                'status' => 'error',
                'message' => 'Enter the Other scholarship packages obtained'
            ];
        } elseif (empty($prog_relevance)) {
            $data1 = [
                'status' => 'error',
                'message' => 'Enter the Relevance of programme to department/university'
            ];
        } elseif (empty($signed)) {
            $data1 = [
                'status' => 'error',
                'message' => 'Click Checkbox to Sign'
            ];
        } elseif (empty($sub_date)) {
            $data1 = [
                'status' => 'error',
                'message' => 'Select Date'
            ];
        } else {
            $sno = $_SESSION['user']['staff_no'];
            $pos_sql = $db->query("select * from study_intention where staff_no = $sno and appstatus = 0");
            if ($pos_sql->num_rows > 0) {
                while ($row = $pos_sql->fetch_assoc()) {
                    $data1[] = $row;
                }
            }
            // var_dump($data1[0]['id']);die();
            if (empty($data1)) {
                $sql = "INSERT INTO study_intention(
                  staff_no,
                  high_edu,
                  study_leave,
                  int_prog,
                  study_place,
                  date_commence,
                  prog_duration,
                  prog_type,
                  study_mode,
                  sponsor_kind,
                  other_scholarship,
                  prog_relevance,
                  signed,
                  appstatus,
                  sub_date
               )";
                $sql .= "VALUES (
                  '${staff_no}',
                  '${high_edu}',
                  '${study_leave}',
                  '${int_prog}',
                  '${study_place}',
                  '${date_commence}',
                  '${prog_duration}',
                  '${prog_type}',
                  '${study_mode}',
                  '${sponsor_kind}',
                  '${other_scholarship}',
                  '${prog_relevance}',
                  '${signed}',
                  '1',
                  '${sub_date}')";

                $sub_a = $db->query($sql);
            } else {
                $apid = $data1[0]['id'];
                $sql = "update study_intention set
                  staff_no = '${staff_no}',
                  high_edu = '${high_edu}',
                  study_leave = '${study_leave}',
                  int_prog = '${int_prog}',
                  study_place = '${study_place}',
                  date_commence = '${date_commence}',
                  prog_duration = '${prog_duration}',
                  prog_type = '${prog_type}',
                  study_mode = '${study_mode}',
                  sponsor_kind = '${sponsor_kind}',
                  other_scholarship = '${other_scholarship}',
                  prog_relevance = '${prog_relevance}',
                  signed = '${signed}',
                  appstatus = '1',
                  sub_date = '${sub_date}' where id = '${apid}'";

                $sub_a = $db->query($sql);
            }

            if ($sub_a) {
                $data1 = [
                    'status' => 'success',
                    'message' => 'Declaration of intention submitted successfully'
                ];
            } else {
                $data1 = [
                    'status' => 'error',
                    'message' => 'Error updating data refresh and try again'
                ];
            }
        }
    }
    echo json_encode($data1);
})->name('send_tnd');

$app->post('/addassessor', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    $r = $app->request();
    // var_dump($r);
    // die();
    // $data = [
    $fname = trim($r->post('fname'));
    $lname = trim($r->post('lname'));
    $phone_no = trim($r->post('phone_no'));
    $email = trim($r->post('email'));
    $country = trim($r->post('country'));
    $city = trim($r->post('city'));
    $address = trim($r->post('address'));
    $edu_level = trim($r->post('edu_level'));
    $curr_institute = trim($r->post('curr_institute'));
    $area_special = trim($r->post('area_special'));
    // ];

    if (empty($r->post('email'))) {
        $data1 = [
            'status' => 'error',
            'message' => 'Please enter email address'
        ];
    } elseif (!filter_var($r->post('email'), FILTER_VALIDATE_EMAIL)) {
        $data1 = [
            'status' => 'error',
            'message' => 'Please enter email in correct format'
        ];
    } else {
        $sql = "INSERT INTO assessors(fname,lname,address,city,email,phone_no,country,edu_level,institution,special_area)";
        $sql .= "VALUES ('${fname}', '${lname}', '${phone_no}', '${email}', '${country}', '${city}', '${address}', '${edu_level}', '${curr_institute}', '${area_special}')";

        $sub_a = $db->query($sql);
        if ($sub_a) {
            $data1 = [
                'status' => 'success',
                'message' => 'Assessor has been added successfully'
            ];
        }
    }
    echo json_encode($data1);
})->name('addassessor');

$app->post('/staff_self_appraisal', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    $r = $app->request();
    // var_dump($r);
    $staff_no = trim($r->post('staff_no'));
    $supervisor_name = trim($r->post('supervisor_name'));
    $supervisors_rank = trim($r->post('supervisors_rank'));
    $yr_review = trim($r->post('yr_review'));
    $accomplishments = trim($r->post('accomplishments'));
    $barriers_challenges = trim($r->post('barriers_challenges'));
    $barriers_challenges_goal = trim($r->post('barriers_challenges_goal'));
    $strength_improvement = trim($r->post('strength_improvement'));
    $new_knowledge = trim($r->post('new_knowledge'));
    $other_information = trim($r->post('other_information'));
    $emp_signed = trim($r->post('emp_signed'));
    $st = '1';
    // echo $staff_no;
    $sql1 = "INSERT INTO staff_self_appraisal(staff_no,supervisor_name,supervisors_rank,yr_onreview,accomplishments,barriers_challenges,barriers_challenges_goal,strength_improvement,new_knowledge,other_information,emp_signed, app_status)";
    $sql1 .= "VALUES (${staff_no},'${supervisor_name}','${supervisors_rank}','${yr_review}','${accomplishments}','${barriers_challenges}','${barriers_challenges_goal}','${strength_improvement}','${new_knowledge}','${other_information}','${emp_signed}','${st}')";
    $getr = $db->query($sql1);
    // echo $sql1;
    // die();
    if ($getr) {
        $data1 = [
            'status' => 'success',
            'message' => 'Appraisal has been submitted successfully'
        ];
        echo json_encode($data1);
    } else {
        $data1 = [
            'status' => 'error',
            'message' => 'Error submitting data'
        ];
        echo json_encode($data1);
    }
    // echo json_encode($data1);
})->name('staff_self_appraisal');


$app->post('/staff_appraisal_update', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    $r = $app->request();
    // var_dump($r);
    // die();
    $staff_app_id = trim($r->post('staff_app_id'));
    $emp_comments = trim($r->post('emp_comments'));
    $staff_no = trim($r->post('staff_no'));
    $yr_onreview = trim($r->post('yr_onreview'));
    $emp_signed = trim($r->post('emp_signed'));

    $sql = $db->query("UPDATE staff_appraisal SET `emp_signed` = '${emp_signed}', emp_comments = '${emp_comments}', `app_status` = '2' 
      WHERE `staff_no` = ${staff_no} AND `yr_onreview` = ${yr_onreview}");
    if ($sql) {
        $data1 = [
            'status' => 'success',
            'message' => 'Appraisal has been submitted successfully'
        ];
    }
    echo json_encode($data1);
})->name('staff_appraisal_update');

$app->post('/staff_appraisal', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    $r = $app->request();
    // var_dump($r);
    // die();
    // var_dump($_POST['question_id']);
    $reply1 = '';
    $eg1 = '';
    $qid = $r->post('question_id');
    $reply = $r->post('radiobtn');
    $eg = $r->post('support_eg');
    $cid = $r->post('cat_id');
    // var_dump($reply);
    // echo '<br>';
    // echo '<br>';
    // var_dump($qid);
    // die();
    for ($i = 0; $i < count($r->post('question_id')); $i++) {
        // $data = [
        $staff_no = trim($r->post('staff_no'));
        $supervisor_name = trim($r->post('supervisor_name1'));
        $supervisors_rank = trim($r->post('supervisors_rank'));
        $yr_onreview = trim($r->post('yr_onreview'));
        $purpose_curr_review = trim($r->post('purpose_curr_review'));
        $question = $qid[$i];
        $question_cat = $cid[$i];
        $reply1 = $reply[$i];
        // echo $reply;
        // die();
        $eg1 = $eg[$i];
        $curr_year_obj = trim($r->post('curr_year_obj'));
        $dev_needs = trim($r->post('dev_needs'));
        $overall_summary = trim($r->post('overall_summary'));
        $sup_rating = trim($r->post('sup_rating'));
        $sup_signed = trim($r->post('sup_signed1'));
        $app_status = '1';
        // ];

        // $mine = $this->userModel->staffAppraisal($data);
        $sqlin = "INSERT INTO staff_appraisal(staff_no,supervisor_name,supervisors_rank,yr_onreview,purpose_curr_review,question,curr_year_obj,dev_needs,
         overall_summary,sup_rating,sup_signed, question_cat, eg, reply, app_status)";
        $sqlin .= "VALUES ('${staff_no}', '${supervisor_name}', '${supervisors_rank}', '${yr_onreview}', '${purpose_curr_review}', '${question}', 
         '${curr_year_obj}', '${dev_needs}', '${overall_summary}', '${sup_rating}', '${sup_signed}', '${question_cat}', '${eg1}', '${reply1}', '${app_status}')";
        // echo $sqlin;
        // die();
        $instsql = $db->query($sqlin);
    }
    if ($instsql) {
        $data1 = [
            'status' => 'success',
            'message' => 'Appraisal has been submitted successfully'
        ];
    } else {
        $data1 = [
            'status' => 'error',
            'message' => 'Error submitting appraisal retry'
        ];
    }
    echo json_encode($data1);
})->name('staff_appraisal');

$app->post('/procure_aproval', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    // var_dump($_POST);
    // die();
    $staff_no = $_SESSION['user']['staff_no'];
    $unit_id = $_SESSION['user']['unit_id'];
    $file_type = ['image/jpg', 'image/png', 'image/jpeg', 'application/pdf'];
    // $r = $app->request();

    $request_id = trim($_POST['promo_id']);
    $stage_status = trim($_POST['radio']);
    $comment = trim($_POST['comment']);
    $promo_status = trim($_POST['promo_stage']);
    $apply_type = trim($_POST['apply_type']);

    $pos_sql = $db->query("SELECT sum(total_price) as sum_total FROM procurement.request_breakdown where request_id = $request_id");
    $cheks = $db->query("SELECT * FROM procurement.request_breakdown where request_id = $request_id and budget_state = 'UNBUDGETED'");
    $getunitshortname = $db->query("SELECT * from procurement.request as t1 left join hr.unit as t2 on t1.unit_id = t2.id 
   left join hr.staff as t3 on t2.unit_head = t3.staff_no or t3.staff_no = t2.unit_subhead where request_id = $request_id");
    while ($row = $getunitshortname->fetch_assoc()) {
        $ps2[] = $row;
    }
    $short_name = $ps2[0]['short_name'];
    $faculty_id = $ps2[0]['faculty_id'];
    $college_id = $ps2[0]['college_id'];
    $parent_id = $ps2[0]['parent_id'];

    $data2 = [];
    if ($pos_sql->num_rows > 0) {
        while ($row = $pos_sql->fetch_assoc()) {
            $data2[] = $row;
        }
    }

    $total_p = $data2[0]['sum_total'];

    if (empty($_POST['radio']) || empty($_POST['promo_id']) || empty($_POST['comment']) || empty($_POST['promo_stage'])) {

        $data1 = [
            'status' => 'error',
            'message' => 'Please fill all inputs'
        ];
    } else {

        if ($_POST['promo_stage'] == 7) {
            if ($_POST['radio'] == 1) {
                $stage_activity = 'Approved';
                $desc = 'Approved Procurement List';
                if ($_SESSION['headtype'] == 'ACADEMIC') {
                    if ($_SESSION['uhead'] == '03') {
                        if ($total_p <= 5000) {
                            if ($cheks->num_rows > 0) {
                                $promo_status = 3;
                            } else {
                                $promo_status = 4;
                            }
                        } else {
                            $promo_status = 1;
                            $pos_sql = $db->query("SELECT * from hr.unit as t1 
                          left join hr.staff as t2 on t1.unit_head = t2.staff_no or t2.staff_no = t1.unit_subhead
                          where t2.id = '$faculty_id'");
                            while ($row = $pos_sql->fetch_assoc()) {
                                $ps2[] = $row;
                            }
                            $phone = $ps2[0]['phone'];
                        }
                        $status = 1;
                    } elseif ($_SESSION['uhead'] == '02') {
                        if ($total_p <= 10000) {
                            if ($cheks->num_rows > 0) {
                                $promo_status = 3;
                            } else {
                                $promo_status = 4;
                            }
                        } else {
                            $promo_status = 2;
                            $pos_sql = $db->query("SELECT * from hr.unit as t1 
                          left join hr.staff as t2 on t1.unit_head = t2.staff_no or t2.staff_no = t1.unit_subhead
                          where t2.id = '$college_id'");
                            while ($row = $pos_sql->fetch_assoc()) {
                                $ps2[] = $row;
                            }
                            $phone = $ps2[0]['phone'];
                        }
                        $status = 2;
                    } elseif ($_SESSION['uhead'] == '01') {
                        if ($total_p <= 15000) {
                            if ($cheks->num_rows > 0) {
                                $promo_status = 3;
                            } else {
                                $promo_status = 4;
                            }
                        } else {
                            $promo_status = 3;
                        }
                        $status = 3;
                    } elseif ($_SESSION['uhead'] == '04') {
                        if ($total_p <= 150000) {
                            if ($cheks->num_rows > 0) {
                                $promo_status = 3;
                            } else {
                                $promo_status = 4;
                            }
                        } else {
                            $promo_status = 5;
                        }
                        $status = 4;
                    }
                } else {
                    if ($_SESSION['uhead'] == '03') {
                        $promo_status = 1;
                        $status = 1;
                        $pos_sql = $db->query("SELECT * from hr.unit as t1 
                         left join hr.staff as t2 on t1.unit_head = t2.staff_no or t2.staff_no = t1.unit_subhead
                         where t1.id = '$parent_id'");
                        while ($row = $pos_sql->fetch_assoc()) {
                            $ps2[] = $row;
                        }
                        $phone = $ps2[0]['phone'];
                    } elseif ($_SESSION['uhead'] == '02') {
                        $promo_status = 2;
                        $status = 2;
                        $pos_sql = $db->query("SELECT * FROM hr.staff AS t1 
                      left join hr.unit as t2 on t1.unit_id = t2.id
                      WHERE t2.type ='NON-ACADEMIC'");
                        while ($row = $pos_sql->fetch_assoc()) {
                            $ps2[] = $row;
                        }
                        $phone = $ps2[0]['phone'];
                        //  $phone = '0547268141';

                    } elseif ($_SESSION['uhead'] == '01') {
                        if ($total_p <= 15000) {
                            if ($cheks->num_rows > 0) {
                                $promo_status = 3;
                            } else {
                                $promo_status = 4;
                            }
                        } else {
                            $promo_status = 3;
                        }
                        $status = 3;
                    } elseif ($_SESSION['uhead'] == '04') {
                        $promo_status = 4;
                        $status = 4;
                    }
                }
            } elseif ($_POST['radio'] == 2) {
                $stage_activity = 'Disapproved';
                $desc = 'Disapproved Procurement List';
                $promo_status = $stage[1];
            }
            $stage_activity = trim($stage_activity);


            $sql = "UPDATE procurement.request SET stage = ${promo_status}, stage_status = '${stage_status}', status = '${status}' where request_id = $request_id";
            $run = $db->query($sql);
            if ($run) {
                // var_dump($run);
                // die();
                $sql1 = "INSERT INTO procurement.request_log(unit_id,request_id,staff_no,status,stage,stage_status,type,item_description,comments)";
                $sql1 .= "VALUES (${unit_id},${request_id},${staff_no},'${status}','${promo_status}','${stage_status}','1','${comment}','${desc}')";

                $getr = $db->query($sql1);

                if ($getr) {

                    if (!empty($phone)) {
                        //  $phone = '0547268141';
                        $message = 'You have a procurement request from ' . $short_name . ' awaiting your approval. Please login https://staffportal.ucc.edu.gh to approve.';
                        $key = 'pgC2DPZTwdbe68qPkuo4G36bV';
                        $sender_id = 'PROCUREMENT';
                        $url = "http://clientlogin.bulksmsgh.com/smsapi?key=$key&to=$phone&msg=$message&sender_id=$sender_id";
                        //$url="http://clientlogin.bulksmsgh.com/smsapi?key=d413ba965ae771f637de&to=233244665289&msg=ernest&sender_id=ucc"; 	 
                        $cSession = curl_init();
                        //step2
                        curl_setopt($cSession, CURLOPT_URL, "$url");
                        curl_setopt($cSession, CURLOPT_RETURNTRANSFER, true);
                        curl_setopt($cSession, CURLOPT_HEADER, false);
                        //step3
                        $result = curl_exec($cSession);
                        //step4
                        curl_close($cSession);
                    }

                    $data1 = [
                        'status' => 'success',
                        'message' => 'Procurement has been ' . $stage_activity . ' successfully'
                    ];
                } else {
                    $data1 = [
                        'status' => 'error',
                        'message' => 'Encounted an error please refresh and try again'
                    ];
                }
            } else {
                $data1 = [
                    'status' => 'error',
                    'message' => 'Update was not done'
                ];
            }
        } else {
            $stage = explode(',', $_POST['promo_stage']);
            if ($_POST['radio'] == 1) {
                $stage_activity = 'Approved';
                $desc = 'Approved Procurement List';
                // $_POST['promo_stage'] = $stage[0];

                if ($_SESSION['headtype'] == 'ACADEMIC') {
                    if ($_SESSION['uhead'] == '03') {
                        if ($total_p <= 5000) {
                            if ($cheks->num_rows > 0) {
                                $promo_status = 2;
                            } else {
                                $promo_status = 4;
                            }
                        } else {
                            $promo_status = 1;
                        }
                        $status = 1;
                    } elseif ($_SESSION['uhead'] == '02') {
                        if ($total_p <= 10000) {
                            if ($cheks->num_rows > 0) {
                                $promo_status = 2;
                            } else {
                                $promo_status = 4;
                            }
                        } else {
                            $promo_status = 2;
                        }
                        $status = 2;
                    } elseif ($_SESSION['uhead'] == '01') {
                        if ($total_p <= 15000) {
                            if ($cheks->num_rows > 0) {
                                $promo_status = 4;
                            } else {
                                $promo_status = 4;
                            }
                        } else {
                            $promo_status = 3;
                        }
                        $status = 3;
                    } elseif ($_SESSION['uhead'] == '04') {
                        if ($total_p <= 150000) {
                            if ($cheks->num_rows > 0) {
                                $promo_status = 3;
                            } else {
                                $promo_status = 4;
                            }
                        } else {
                            $promo_status = 5;
                        }
                        $status = 4;
                    }
                } else {
                    if ($_SESSION['uhead'] == '03') {
                        $promo_status = 1;
                        $status = 1;
                    } elseif ($_SESSION['uhead'] == '02') {
                        $promo_status = 2;
                        $status = 2;
                    } elseif ($_SESSION['uhead'] == '01') {
                        if ($total_p <= 15000) {
                            if ($cheks->num_rows > 0) {
                                $promo_status = 4;
                            } else {
                                $promo_status = 4;
                            }
                        } else {
                            $promo_status = 3;
                        }
                        $status = 3;
                    } elseif ($_SESSION['uhead'] == '04') {
                        $promo_status = 4;
                        $status = 4;
                    }
                }
            } elseif ($_POST['radio'] == 2) {
                $stage_activity = 'Disapproved';
                $desc = 'Disapproved Procurement List';
                $status = $stage[0];
                $promo_status = $stage[1];
            }
            $request_id = trim($_POST['promo_id']);
            $stage_status = trim($_POST['radio']);
            $comment = trim($_POST['comment']);
            // $promo_status = trim($_POST['promo_stage']);
            $apply_type = trim($_POST['apply_type']);
            $stage_activity = trim($stage_activity);

            $sql = "UPDATE procurement.request SET stage = ${promo_status}, stage_status = '${stage_status}', status = '${status}' where request_id = $request_id";
            // var_dump($sql);die();
            $run = $db->query($sql);

            if ($run) {
                $sql1 = "INSERT INTO procurement.request_log(unit_id,request_id,staff_no,status,stage,stage_status,type,item_description,comments)";
                $sql1 .= "VALUES (${unit_id},${request_id},${staff_no},'$status','${promo_status}','${stage_status}','1','${comment}','${desc}')";


                $getr = $db->query($sql1);
                if ($getr) {
                    $data1 = [
                        'status' => 'success',
                        'message' => 'Procurement has been ' . $stage_activity . ' successfully'
                    ];
                } else {
                    $data1 = [
                        'status' => 'error',
                        'message' => 'Procurement could not be inserted'
                    ];
                }
            } else {
                $data1 = [
                    'status' => 'error',
                    'message' => 'Update was not done'
                ];
            }
        }
    }
    echo json_encode($data1);
})->name('procure_aproval');


$app->post('/procure_aprovalcomment', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    // var_dump($_POST);
    // die();
    $staff_no = $_SESSION['user']['staff_no'];
    $unit_id = $_SESSION['user']['unit_id'];
    $file_type = ['image/jpg', 'image/png', 'image/jpeg', 'application/pdf'];
    // $r = $app->request();

    $request_id = trim($_POST['promo_id']);
    $comment = trim($_POST['comment']);
    $stage = explode(',', $_POST['promo_stage']);
    $status = $stage[2];
    $promo_status = $stage[0];
    $stage_status = $stage[1];


    $sql = "UPDATE procurement.comments SET comments = '${comment}', commented_staff = '${staff_no}', status = 1, activity_replytime = current_timestamp where request_id = $request_id";
    $run = $db->query($sql);

    $sql2 = "UPDATE procurement.request SET stage_status = 4 where request_id = $request_id";
    $run2 = $db->query($sql2);
    // var_dump($sql);die();
    if ($run2) {
        $sql1 = "INSERT INTO procurement.request_log(unit_id,request_id,staff_no,status,stage,stage_status,type,item_description,comments)";
        $sql1 .= "VALUES (${unit_id},${request_id},${staff_no},'$status','${promo_status}','4','1','Reviewed/Commented','${comment}')";

        $getr = $db->query($sql1);
        if ($getr) {
            $data1 = [
                'status' => 'success',
                'message' => 'Procurement has been successfully'
            ];
        } else {
            $data1 = [
                'status' => 'error',
                'message' => 'Procurement could not be inserted'
            ];
        }
    }


    echo json_encode($data1);
})->name('procure_aprovalcomment');

$app->post('/promo_aproval', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    // var_dump($_POST);
    // die();
    $staff_no = $_SESSION['user']['staff_no'];
    $unit_id = $_SESSION['user']['unit_id'];
    $file_type = ['image/jpg', 'image/png', 'image/jpeg', 'application/pdf'];
    // $r = $app->request();
    $files = array_filter($_FILES['input-folder-3']['name']);
    $file_count = count($_FILES['input-folder-3']['name']);
    $tempfile = array_filter($_FILES['input-folder-3']['tmp_name']);
    $typefile = array_filter($_FILES['input-folder-3']['type']);
    $timestamp = time() + date("Z");
    $timetoday = gmdate("Ymd-His", $timestamp);
    if ((!in_array(!empty($typefile), $file_type)) || (in_array(!empty($typefile1), $file_type))) {
        $data1 = [
            'status' => 'error',
            'message' => 'File format not supported please upload a new file(.pdf)'
        ];
    }
    if (in_array(!empty($typefile), $file_type)) {
        if ($tempfile != "") {
            $newfilePath = dirname(dirname(__FILE__)) . "/public/images/all_units_files/" . $timetoday . $files[0];
            $file1 = move_uploaded_file($tempfile[0], $newfilePath);
            if ($file1) {
                $newfilePath = $newfilePath;
                $newfilePath;
            } else {
                $data1 = [
                    'status' => 'error',
                    'message' => 'Files not uploaded'
                ];
            }
        } else {
            $newfilePath = "";
        }
    } else {
        $newfilePath = "";
    }
    $newfilePath;

    if (empty($_POST['radio']) || empty($_POST['promo_id']) || empty($_POST['comment']) || empty($_POST['promo_stage'])) {

        $data1 = [
            'status' => 'error',
            'message' => 'Please fill all inputs'
        ];
    } elseif (empty($newfilePath)) {

        $data1 = [
            'status' => 'error',
            'message' => 'Please upload file/file not supported please upload a new file(eg file.pdf)'
        ];
    } else {

        if ($_POST['promo_stage'] == 7) {
            if (!empty($newfilePath)) {
                if ($_POST['radio'] == 1) {
                    $stage_activity = 'Approved';
                } elseif ($_POST['radio'] == 2) {
                    $stage_activity = 'Disapproved';
                }
                $promotion_id = trim($_POST['promo_id']);
                $stage_status = trim($_POST['radio']);
                $comment = trim($_POST['comment']);
                $promo_status = trim($_POST['promo_stage']);
                $apply_type = trim($_POST['apply_type']);
                $stage_activity = trim($stage_activity);
                $action_file = trim($newfilePath);

                $sql = "UPDATE staff_promotion 
         SET promo_status = '${promo_status}', stage_status = '${stage_status}',stage = '${stage_activity}' 
         WHERE promotion_id = $promotion_id";
                $run = $db->query($sql);
                if ($run) {
                    // var_dump($run);
                    // die();
                    $from = 'staffportal@ucc.edu.gh';
                    // $to = 'richmond.nketia@ucc.edu.gh';
                    $to = $ucc_mail;
                    $subject = 'Promotion Request';
                    $body = '';
                    $body .= '
                <div align="center">
                    <div class="center" align="center">
                        <div class="col-4">
                    <img src="/var/www/html/staffportal.ucc.edu.gh/public/images/ucclogo1.png" width="50" height="50" alt="UCC" class="light-logo" />
                        </div>
                        <div class="col-8">
                            <h2 class="card-title text-uppercase">UNIVERSITY OF CAPE COAST</h2>
                            <h1 class="card-title text-uppercase">STAFF PORTAL</h1>
                        </div>
                    </div>
                    <p>You have a promotion request awaiting your approval. Please login to https://staffportal.ucc.edu.gh and attend to it.</p>                            
                </div>
                ';
                    $sql1 = "INSERT INTO promo_activities(unit_id,user_id,promotion_id,stage_activity,comments,promo_status,activity,stage_file,type)";
                    $sql1 .= "VALUES (${unit_id}, ${staff_no}, ${promotion_id}, '${stage_activity}', '${comment}', '${promo_status}', '${stage_status}','${action_file}','${apply_type}')";
                    $getr = $db->query($sql1);

                    if ($getr) {
                        if ($_SESSION['user']['staff_type'] == 'NON-ACADEMIC') {
                            $udata = "SELECT t4.title, t4.fname, t4.phone, t4.ucc_mail from hr.staff_promotion as t1 left join hr.unit as t2 on t1.unit_id = t2.id
                    left join hr.unit as t3 on t2.parent_id = t3.id left join hr.staff as t4 on t3.unit_head = t4.staff_no WHERE t2.id = $unit_id";
                        } else {
                            $udata = "SELECT t4.title, t4.fname, t4.phone, t4.ucc_mail from hr.staff_promotion as t1 left join hr.unit as t2 on t1.unit_id = t2.id
                    left join hr.unit as t3 on t2.dept_id = t3.id left join hr.staff as t4 on t3.unit_head = t4.staff_no WHERE t2.id = $unit_id";
                        }

                        $udata = $db->query($udata);
                        $rel2 = [];
                        while ($row1 = $udata->fetch_assoc()) {
                            $rel2[] = $row1;
                        }
                        foreach ($rel2 as $st_iddata) {
                            $phone = $st_iddata['phone'];
                            $ucc_mail = $st_iddata['ucc_mail'];
                        }

                        if (!empty($ucc_mail)) {
                            $post_data = array(
                                "From" => $from,
                                "To" => $to,
                                "Subject" => $subject,
                                "HtmlBody" => $body,
                                "MessageStream" => "outbound"
                            );
                            $curl = curl_init();
                            curl_setopt_array($curl, array(
                                CURLOPT_URL => 'https://api.postmarkapp.com/email',
                                CURLOPT_SSL_VERIFYPEER => false,
                                CURLOPT_RETURNTRANSFER => true,
                                CURLOPT_ENCODING => "",
                                CURLOPT_MAXREDIRS => 10,
                                CURLOPT_TIMEOUT => 30,
                                // CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                                CURLOPT_CUSTOMREQUEST => 'POST',
                                CURLOPT_POSTFIELDS => json_encode($post_data),
                                CURLOPT_HTTPHEADER => array(
                                    "Accept: application/json",
                                    "Content-Type: application/json",
                                    "X-Postmark-Server-Token: 4fac9f37-7a49-4186-8f32-8022b9f43cc4",
                                )
                            ));

                            // $response = curl_exec($curl);
                            // $err = curl_error($curl);
                            curl_close($curl);
                            // return $response ? true :$err;
                        }

                        if (!empty($phone)) {
                            //  $phone = '0547268141';
                            $message = 'You have a promotion request awaiting your approval. Please login to https://staffportal.ucc.edu.gh and attend to it.';
                            $key = 'pgC2DPZTwdbe68qPkuo4G36bV';
                            $sender_id = 'UCC';
                            $url = "http://clientlogin.bulksmsgh.com/smsapi?key=$key&to=$phone&msg=$message&sender_id=$sender_id";
                            //$url="http://clientlogin.bulksmsgh.com/smsapi?key=d413ba965ae771f637de&to=233244665289&msg=ernest&sender_id=ucc"; 	 
                            $cSession = curl_init();
                            //step2
                            curl_setopt($cSession, CURLOPT_URL, "$url");
                            curl_setopt($cSession, CURLOPT_RETURNTRANSFER, true);
                            curl_setopt($cSession, CURLOPT_HEADER, false);
                            //step3
                            $result = curl_exec($cSession);
                            //step4
                            curl_close($cSession);
                        }
                        $data1 = [
                            'status' => 'success',
                            'message' => 'Application has been ' . $stage_activity . ' successfully'
                        ];
                    } else {
                        $data1 = [
                            'status' => 'error',
                            'message' => 'Encounted an error please refresh and try again'
                        ];
                    }
                } else {
                    $data1 = [
                        'status' => 'error',
                        'message' => 'Update was not done'
                    ];
                }
            } else {
                $data1 = [
                    'status' => 'error',
                    'message' => 'Files not uploaded try again'
                ];
            }
        } else {

            if (!empty($newfilePath)) {
                $stage = explode(',', $_POST['promo_stage']);
                if ($_POST['radio'] == 1) {
                    $stage_activity = 'Approved';
                    $_POST['promo_stage'] = $stage[0];
                } elseif ($_POST['radio'] == 2) {
                    $stage_activity = 'Disapproved';
                    $_POST['promo_stage'] = $stage[1];
                }
                $promotion_id = trim($_POST['promo_id']);
                $stage_status = trim($_POST['radio']);
                $comment = trim($_POST['comment']);
                $promo_status = trim($_POST['promo_stage']);
                $apply_type = trim($_POST['apply_type']);
                $stage_activity = trim($stage_activity);
                $action_file = trim($newfilePath);

                $sql = "UPDATE staff_promotion 
         SET promo_status = '${promo_status}', stage_status = '${stage_status}',stage = '${stage_activity}' 
         WHERE promotion_id = $promotion_id";
                $run = $db->query($sql);

                if ($run) {
                    $sql1 = "INSERT INTO promo_activities(unit_id,user_id,promotion_id,stage_activity,comments,promo_status,activity,stage_file,type)";
                    $sql1 .= "VALUES (${unit_id}, ${staff_no}, ${promotion_id}, '${stage_activity}', '${comment}', '${promo_status}', '${stage_status}','${action_file}','${apply_type}')";

                    $getr = $db->query($sql1);
                    if ($getr) {
                        $udata = "SELECT t2.title, t2.fname, t2.phone FROM hr.unit as t1 left join hr.staff as t2 on t1.unit_head = t2.staff_no WHERE t1.id = $unit_id";
                        $udata = $db->query($udata);
                        $rel2 = [];
                        while ($row1 = $udata->fetch_assoc()) {
                            $rel2[] = $row1;
                        }
                        foreach ($rel2 as $st_iddata) {
                            $phone = $st_iddata['phone'];
                        }
                        if (!empty($phone)) {
                            //  $phone = '0547268141';
                            $message = 'You have a promotion request awaiting your approval. Please login to https://staffportal.ucc.edu.gh and attend to it.';
                            $key = 'pgC2DPZTwdbe68qPkuo4G36bV';
                            $sender_id = 'UCC';
                            $url = "http://clientlogin.bulksmsgh.com/smsapi?key=$key&to=$phone&msg=$message&sender_id=$sender_id";
                            //$url="http://clientlogin.bulksmsgh.com/smsapi?key=d413ba965ae771f637de&to=233244665289&msg=ernest&sender_id=ucc"; 	 
                            $cSession = curl_init();
                            //step2
                            curl_setopt($cSession, CURLOPT_URL, "$url");
                            curl_setopt($cSession, CURLOPT_RETURNTRANSFER, true);
                            curl_setopt($cSession, CURLOPT_HEADER, false);
                            //step3
                            $result = curl_exec($cSession);
                            //step4
                            curl_close($cSession);
                        }
                        $data1 = [
                            'status' => 'success',
                            'message' => 'Application has been ' . $stage_activity . ' successfully'
                        ];
                    } else {
                        $data1 = [
                            'status' => 'error',
                            'message' => 'Promotion could not be inserted'
                        ];
                    }
                } else {
                    $data1 = [
                        'status' => 'error',
                        'message' => 'Update was not done'
                    ];
                }
            } else {
                $data1 = [
                    'status' => 'error',
                    'message' => 'Files not uploaded or encounted an error'
                ];
            }
        }
    }
    echo json_encode($data1);
})->name('promo_aproval');

$app->post('/tndapproval', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    // var_dump($_POST);
    // die();
    $staff_no = $_SESSION['user']['staff_no'];
    $unit_id = $_SESSION['user']['unit_id'];

    if (empty($_POST['radio']) || empty($_POST['promo_id']) || empty($_POST['comment']) || empty($_POST['promo_stage'])) {

        $data1 = [
            'status' => 'error',
            'message' => 'Please fill all inputs'
        ];
    } else {

        if ($_POST['promo_stage'] == 7) {
            if (!empty($newfilePath)) {
                if ($_POST['radio'] == 1) {
                    $stage_activity = 'Approved';
                } elseif ($_POST['radio'] == 2) {
                    $stage_activity = 'Disapproved';
                }
                $promotion_id = trim($_POST['promo_id']);
                $stage_status = trim($_POST['radio']);
                $comment = trim($_POST['comment']);
                $promo_status = trim($_POST['promo_stage']);
                $apply_type = trim($_POST['apply_type']);
                $stage_activity = trim($stage_activity);

                $sql = "UPDATE study_intention 
            SET appstatus = '${promo_status}', stage_status = '${stage_status}'
            WHERE id = $promotion_id";
                // echo $sql;die();
                $run = $db->query($sql);
                if ($run) {
                    // var_dump($run);
                    // die();
                    $sql1 = "INSERT INTO tndstudy_activities(unit_id,user_id,studyform_id,stage_activity,comments,promo_status,activity)";
                    $sql1 .= "VALUES (${unit_id}, ${staff_no}, ${promotion_id}, '${stage_activity}', '${comment}', '${promo_status}', '${stage_status}')";
                    $getr = $db->query($sql1);

                    if ($getr) {
                        $data1 = [
                            'status' => 'success',
                            'message' => 'Application has been ' . $stage_activity . ' successfully'
                        ];
                    } else {
                        $data1 = [
                            'status' => 'error',
                            'message' => 'Encounted an error please refresh and try again'
                        ];
                    }
                } else {
                    $data1 = [
                        'status' => 'error',
                        'message' => 'Update was not done'
                    ];
                }
            } else {
                $data1 = [
                    'status' => 'error',
                    'message' => 'Files not uploaded try again'
                ];
            }
        } else {

            $stage = explode(',', $_POST['promo_stage']);
            if ($_POST['radio'] == 1) {
                $stage_activity = 'Approved';
                $_POST['promo_stage'] = $stage[0];
            } elseif ($_POST['radio'] == 2) {
                $stage_activity = 'Disapproved';
                $_POST['promo_stage'] = $stage[1];
            }
            $promotion_id = trim($_POST['promo_id']);
            $stage_status = trim($_POST['radio']);
            $comment = trim($_POST['comment']);
            $promo_status = trim($_POST['promo_stage']);
            $apply_type = trim($_POST['apply_type']);
            $stage_activity = trim($stage_activity);

            $sql = "UPDATE study_intention 
            SET appstatus = '${promo_status}', stage_status = '${stage_status}' 
            WHERE id = $promotion_id";
            // echo $sql;die();
            $run = $db->query($sql);

            if ($run) {
                $sql1 = "INSERT INTO tndstudy_activities(unit_id,user_id,studyform_id,stage_activity,comments,promo_status,activity)";
                $sql1 .= "VALUES (${unit_id}, ${staff_no}, ${promotion_id}, '${stage_activity}', '${comment}', '${promo_status}', '${stage_status}')";
                // echo $sql1;die();
                $getr = $db->query($sql1);
                if ($getr) {
                    $data1 = [
                        'status' => 'success',
                        'message' => 'Application has been ' . $stage_activity . ' successfully'
                    ];
                } else {
                    $data1 = [
                        'status' => 'error',
                        'message' => 'Promotion could not be inserted'
                    ];
                }
            } else {
                $data1 = [
                    'status' => 'error',
                    'message' => 'Update was not done'
                ];
            }
        }
    }
    echo json_encode($data1);
})->name('tndapproval');

$app->post('/promo_returning', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    // var_dump($_POST);
    // die();
    $files = $_FILES['input-folder-3']['name'];
    $r = $app->request();
    $file_count = $_FILES['input-folder-3']['name'];
    $tempfile = $_FILES['input-folder-3']['tmp_name'];
    $typefile = $_FILES['input-folder-3']['type'];
    $timestamp = time() + date("Z");
    $timetoday = gmdate("Ymd-His", $timestamp);
    $file_type = ['image/jpg', 'image/png', 'image/jpeg', 'application/pdf'];

    if (empty($files)) {
        $data1 = [
            'status' => 'error',
            'message' => 'Please upload your Document'
        ];
    }
    if (empty($files1)) {
        $data1 = [
            'status' => 'error',
            'message' => 'Please upload your papers'
        ];
    }
    if ((!in_array(!empty($typefile), $file_type))) {
        $data1 = [
            'status' => 'error',
            'message' => 'File format not supported please upload a new file(.pdf)'
        ];
    }
    if (in_array(!empty($typefile), $file_type)) {
        if ($tempfile != "") {
            $newfilePath = dirname(dirname(__FILE__)) . "/public/images/staff_doc/" . $timetoday . $files;
            //   $newfilePathh = "/public/images/staff_doc/".$timetoday.$files[0];
            //   $newfilePath11 = "/public/images/staff_doc/".$timetoday.$files[1];
            $file1 = move_uploaded_file($tempfile, $newfilePath);
            //   echo $newfilePath1;
            //   die();
            if ($file1) {
                $newfilePath2 = $newfilePath;
                $newfilePath2;
            }
        } else {
            $newfilePath = "";
            //   echo $newfilePath;
        }
    } else {
        $newfilePath = "";
        //  echo $newfilePath;
    }
    //   }
    //   echo $newfilePath2;
    //   die();

    if (!empty($newfilePath2)) {
        if (empty($newfilePath2)) {
            $data1 = [
                'status' => 'error',
                'message' => 'Please upload your Updated File'
            ];
        }
        if (!empty($newfilePath2)) {
            // $data = [

            $staff_no = $_SESSION['user']['staff_no'];
            $app_type = trim($r->post('apply_type'));
            $comment = trim($r->post('comment'));
            $promo_doc1 = $newfilePath2;
            $unit_id = $_SESSION['user']['unit_id'];
            $staff_group = $_SESSION['user']['staff_group'];
            $job_id = $_SESSION['user']['job_id'];
            $promo_id = trim($r->post('promo_id'));
            $stage = explode(',', $_POST['promo_stage']);
            $promo_status = $stage[0];
            $activity = $stage[1];

            if ($stage[1] == 10) {
                $stage_activity = 'Updated CV, Papers and Application Form Uploaded';
            } elseif ($stage[1] == 9) {
                $stage_activity = 'Updated Papers Uploaded';
            } elseif ($stage[1] == 8) {
                $stage_activity = 'Updated CV Uploaded';
            } elseif ($stage[1] == 11) {
                $stage_activity = 'Updated Application Form Uploaded';
            }

            $user_id = $_SESSION['user']['staff_no'];
            // ];

            if (empty($_FILES)) {
                $data1 = [
                    'status' => 'error',
                    'message' => 'Please select a file'
                ];
            } elseif (empty($newfilePath)) {
                $data1 = [
                    'status' => 'error',
                    'message' => 'File format should be an image or a pdf'
                ];
            } else {
                if (!empty($_FILES) && !empty($newfilePath)) {
                    $sql = "UPDATE staff_promotion 
               SET promo_status = '${promo_status}', stage_status = '0',stage = '${stage_activity}',
               returned = '0'
               WHERE promotion_id = $promo_id";
                    $run = $db->query($sql);
                    if ($run) {
                        if ($stage[1] == 9) {
                            $sql1 = "INSERT INTO promo_activities(unit_id,user_id,promotion_id,stage_activity,comments,promo_status,activity,type,updatedpapers)";
                            $sql1 .= "VALUES (${unit_id},${user_id},${promo_id},'${stage_activity}','${comment}','${promo_status}','${activity}','${app_type}','${promo_doc1}')";
                        } elseif ($stage[1] == 8) {
                            $sql1 = "INSERT INTO promo_activities(unit_id,user_id,promotion_id,stage_activity,comments,promo_status,activity,type,updatedcv)";
                            $sql1 .= "VALUES (${unit_id},${user_id},${promo_id},'${stage_activity}','${comment}','${promo_status}','${activity}','${app_type}','${promo_doc1}')";
                        } elseif ($stage[1] == 11) {
                            $sql1 = "INSERT INTO promo_activities(unit_id,user_id,promotion_id,stage_activity,comments,promo_status,activity,type,updatedform)";
                            $sql1 .= "VALUES (${unit_id},${user_id},${promo_id},'${stage_activity}','${comment}','${promo_status}','${activity}','${app_type}','${promo_doc1}')";
                        }
                        $getr = $db->query($sql1);
                        if ($getr) {
                            $data1 = [
                                'status' => 'success',
                                'message' => 'File have been submitted successfully'
                            ];
                        }
                    }
                } else {
                    die('Something went wrong.');
                }
            }
        }
    }
    echo json_encode($data1);
})->name('promo_returning');

$app->post('/promo_aprovalmienu', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    $file_type = ['image/jpg', 'image/png', 'image/jpeg', 'application/pdf'];
    $r = $app->request();
    // echo $position = $r->post('position');
    //    var_dump($_POST);
    //    var_dump($_FILES);
    // die();
    $files = $_FILES['input-folder-3']['name'];
    $file_count = $_FILES['input-folder-3']['name'];
    $tempfile = $_FILES['input-folder-3']['tmp_name'];
    $typefile = $_FILES['input-folder-3']['type'];
    $files1 = $_FILES['input-folder-4']['name'];
    $file_count1 = $_FILES['input-folder-4']['name'];
    $tempfile1 = $_FILES['input-folder-4']['tmp_name'];
    $typefile1 = $_FILES['input-folder-4']['type'];
    $files2 = $_FILES['input-folder-5']['name'];
    $file_count2 = $_FILES['input-folder-5']['name'];
    $tempfile2 = $_FILES['input-folder-5']['tmp_name'];
    $typefile2 = $_FILES['input-folder-5']['type'];
    $timestamp = time() + date("Z");
    $timetoday = gmdate("Ymd-His", $timestamp);

    if (empty($files)) {
        $data1 = [
            'status' => 'error',
            'message' => 'Please upload your CV'
        ];
    }
    if (empty($files1)) {
        $data1 = [
            'status' => 'error',
            'message' => 'Please upload your papers'
        ];
    }
    if (empty($files1)) {
        $data1 = [
            'status' => 'error',
            'message' => 'Please upload your application form'
        ];
    }
    if ((!in_array(!empty($typefile), $file_type)) || (in_array(!empty($typefile1), $file_type)) || (in_array(!empty($typefile2), $file_type))) {
        $data1 = [
            'status' => 'error',
            'message' => 'File format not supported please upload a new file(.pdf)'
        ];
    }
    if (in_array(!empty($typefile), $file_type) && in_array(!empty($typefile1), $file_type)) {
        if ($tempfile != "" && $tempfile1 != "") {
            $newfilePath = dirname(dirname(__FILE__)) . "/public/images/staff_doc/" . $timetoday . '_cv' . $files;
            //   $newfilePathh = "/public/images/staff_doc/".$timetoday.$files[0];
            $newfilePath1 = dirname(dirname(__FILE__)) . "/public/images/staff_doc/" . $timetoday . '_papers' . $files1;
            $newfilePath3 = dirname(dirname(__FILE__)) . "/public/images/staff_doc/" . $timetoday . '_form' . $files2;
            //   $newfilePath11 = "/public/images/staff_doc/".$timetoday.$files[1];
            $file1 = move_uploaded_file($tempfile, $newfilePath);
            $file2 = move_uploaded_file($tempfile1, $newfilePath1);
            $file3 = move_uploaded_file($tempfile2, $newfilePath3);
            //   echo $newfilePath1;
            //   die();
            if ($file1) {
                $newfilePath2 = $newfilePath . ',' . $newfilePath1 . ',' . $newfilePath3;
                $newfilePath2;
            }
        } else {
            $newfilePath = "";
            //   echo $newfilePath;
        }
    } else {
        $newfilePath = "";
        //  echo $newfilePath;
    }
    //   }
    //   echo $newfilePath2;
    //   die();

    if (!empty($newfilePath2)) {
        $fileurl = explode(',', $newfilePath2);
        if (empty($fileurl[0])) {
            $data1 = [
                'status' => 'error',
                'message' => 'Please upload your CV'
            ];
        }
        if (empty($fileurl[1])) {
            $data1 = [
                'status' => 'error',
                'message' => 'Please upload your papers'
            ];
        }
        if (empty($fileurl[2])) {
            $data1 = [
                'status' => 'error',
                'message' => 'Please upload your application form'
            ];
        }
        if (!empty($fileurl[0]) || !empty($fileurl[1]) || empty($fileurl[2])) {

            // $data = [

            $staff_no = $_SESSION['user']['staff_no'];
            $app_type = trim($r->post('apply_type'));
            $comment = trim($r->post('comment'));
            $promo_doc1 = $fileurl[0];
            $promo_doc2 = $fileurl[1];
            $promo_doc3 = $fileurl[2];
            $unit_id = $_SESSION['user']['unit_id'];
            $staff_group = $_SESSION['user']['staff_group'];
            $job_id = $_SESSION['user']['job_id'];
            $promo_id = trim($r->post('promo_id'));
            $stage = explode(',', $_POST['promo_stage']);
            $promo_status = $stage[0];
            $activity = $stage[1];

            if ($stage[1] == 10) {
                $stage_activity = 'Updated CV, Papers and Application Form Uploaded';
            } elseif ($stage[1] == 9) {
                $stage_activity = 'Updated Papers Uploaded';
            } elseif ($stage[1] == 8) {
                $stage_activity = 'Updated CV Uploaded';
            } elseif ($stage[1] == 11) {
                $stage_activity = 'Updated Application Form Uploaded';
            }

            $user_id = $_SESSION['user']['staff_no'];
            // ];

            if (empty($_FILES)) {
                $data1 = [
                    'status' => 'error',
                    'message' => 'Please select a file'
                ];
            } elseif (empty($newfilePath)) {
                $data1 = [
                    'status' => 'error',
                    'message' => 'File format should be an image or a pdf'
                ];
            } else {
                if (!empty($_FILES) && !empty($newfilePath)) {
                    $sql = "UPDATE staff_promotion 
               SET promo_status = '${promo_status}', stage_status = '0',stage = '${stage_activity}',
               returned = '0'
               WHERE promotion_id = $promo_id";
                    $run = $db->query($sql);
                    if ($run) {
                        $sql1 = "INSERT INTO promo_activities(unit_id,user_id,promotion_id,stage_activity,comments,promo_status,activity,type,updatedcv,updatedpapers,updatedform)";
                        $sql1 .= "VALUES (${unit_id},${user_id},${promo_id},'${stage_activity}','${comment}','${promo_status}','${activity}','${app_type}','${promo_doc1}','${promo_doc2}','${promo_doc3}')";
                        $getr = $db->query($sql1);
                        if ($getr) {
                            $data1 = [
                                'status' => 'success',
                                'message' => 'Files have been submitted successfully'
                            ];
                        }
                    }
                } else {
                    die('Something went wrong.');
                }
            }
        }
    }
    echo json_encode($data1);
});

$app->post('/promo_return', 'authenticate', function () use ($app) {
    require_once './config/db.php';
    $host = $app->host;
    // var_dump($_POST);
    // die();
    $staff_no = $_SESSION['user']['staff_no'];
    $unit_id = $_SESSION['user']['unit_id'];

    if (empty($_POST['radio']) || empty($_POST['promo_id']) || empty($_POST['comment1']) || empty($_POST['promo_stage'])) {
        $data1 = [
            'status' => 'error',
            'message' => 'Please fill all inputs'
        ];
    } else {
        // echo 'pal';die();
        // $stage = explode(',', $_POST['promo_stage']);
        if ($_POST['radio'] == 8) {
            $stage_activity = 'Re-submit Curriculum Vitae (CV)';
            // $_POST['promo_stage'] = $stage[0];
        } elseif ($_POST['radio'] == 9) {
            $stage_activity = 'Re-submit Papers';
            // $_POST['promo_stage'] = $stage[1];
        } elseif ($_POST['radio'] == 11) {
            $stage_activity = 'Re-submit Application Form';
            // $_POST['promo_stage'] = $stage[1];
        } elseif ($_POST['radio'] == 10) {
            $stage_activity = 'Re-submit Curriculum Vitae (CV), Papers & Application form';
            // $_POST['promo_stage'] = $stage[1];
        }
        $promotion_id = trim($_POST['promo_id']);
        $stage_status = trim($_POST['radio']);
        $comment = trim($_POST['comment1']);
        $promo_status = trim($_POST['promo_stage']);
        $apply_type = trim($_POST['apply_type']);
        $returned = 1;
        $stage_activity = trim($stage_activity);

        $sql = "UPDATE staff_promotion 
            SET promo_status = '${promo_status}', stage_status = '${stage_status}',stage = '${stage_activity}',
            returned = '${returned}'
            WHERE promotion_id = $promotion_id";
        $run = $db->query($sql);

        if ($run) {
            $sql1 = "INSERT INTO promo_activities(unit_id,user_id,promotion_id,stage_activity,comments,promo_status,activity,type,returned)";
            $sql1 .= "VALUES (${unit_id}, ${staff_no}, ${promotion_id}, '${stage_activity}', '${comment}', '${promo_status}', '${stage_status}','${apply_type}','${returned}')";

            $getr = $db->query($sql1);
            if ($getr) {
                $data1 = [
                    'status' => 'success',
                    'message' => 'Returned for ' . $stage_activity
                ];
            } else {
                $data1 = [
                    'status' => 'error',
                    'message' => 'Promotion could not be inserted'
                ];
            }
        } else {
            $data1 = [
                'status' => 'error',
                'message' => 'Update was not done'
            ];
        }
    }
    echo json_encode($data1);
})->name('promo_return');

$app->get('/phpinfo', function () use ($app) {
    echo phpinfo();
});
$app->get('/downloadfile2/:pid', function ($pid) use ($app) {
    require './config/db.php';
    $token = trim($app->request()->get('token'));
    $dat = "SELECT * FROM staff_promotion WHERE promotion_id = $pid";
    $pro = $db->query($dat);
    $rel = [];
    if ($pro) {
        while ($row = $pro->fetch_assoc()) {
            $rel[] = $row;
        }
    }
    foreach ($rel as $iddata) {
        $file = $iddata['apply_form'];
    }
    if (file_exists($file)) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($file) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file));
        readfile($file);
        exit;
    }
    // die();
});

$app->get('/downloadfile_promos/:pid', function ($pid) use ($app) {
    require './config/db.php';
    //    var_dump($pid);die();
    $appdb = explode(':', $pid);
    $pid = $appdb[0];
    $pid_data = $appdb[1];
    $token = trim($app->request()->get('token'));
    $dat = "SELECT * FROM promotion_data WHERE id = $pid";
    $pro = $db->query($dat);
    $rel = [];
    if ($pro) {
        while ($row = $pro->fetch_assoc()) {
            $rel[] = $row;
        }
    }
    foreach ($rel as $iddata) {
        $file = $iddata[$pid_data];
    }
    if (file_exists($file)) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($file) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file));
        readfile($file);
        exit;
    }
    // die();
});

$app->get('/downloadfile_promos_papers/:pid', function ($pid) use ($app) {
    require './config/db.php';
    //    var_dump($pid);die();
    $appdb = explode(':', $pid);
    $pid = $appdb[0];
    $pid_data = $appdb[1];
    $token = trim($app->request()->get('token'));
    $dat = "SELECT * FROM promo_papers WHERE id = $pid";
    $pro = $db->query($dat);
    $rel = [];
    if ($pro) {
        while ($row = $pro->fetch_assoc()) {
            $rel[] = $row;
        }
    }
    foreach ($rel as $iddata) {
        $file = $iddata[$pid_data];
    }
    if (file_exists($file)) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($file) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file));
        readfile($file);
        exit;
    }
    // die();
});

$app->get('/downloadfile/:pid', function ($pid) use ($app) {
    require './config/db.php';
    $token = trim($app->request()->get('token'));
    $dat = "SELECT * FROM staff_promotion WHERE promotion_id = $pid";
    $pro = $db->query($dat);
    $rel = [];
    if ($pro) {
        while ($row = $pro->fetch_assoc()) {
            $rel[] = $row;
        }
    }
    foreach ($rel as $iddata) {
        $file = $iddata['promo_doc2'];
    }
    if (file_exists($file)) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($file) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file));
        readfile($file);
        exit;
    }
    // die();
});

$app->get('/downloadfile1/:pid', function ($pid) use ($app) {
    require './config/db.php';
    $token = trim($app->request()->get('token'));
    $dat = "SELECT * FROM staff_promotion WHERE promotion_id = $pid";
    $pro = $db->query($dat);
    $rel = [];
    if ($pro) {
        while ($row = $pro->fetch_assoc()) {
            $rel[] = $row;
        }
    }
    foreach ($rel as $iddata) {
        $file = $iddata['promo_doc1'];
    }
    if (file_exists($file)) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($file) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file));
        readfile($file);
        exit;
    }
    // die();
});

/* HRMS Admin Token Provider */
$app->get('/hrmsapp/:sno', function ($sno) use ($app) {
    require './config/db.php';
    $token = trim($app->request()->get('token'));
    $secret = date('Ymd');
    $sno = trim($sno);
    if ($token != '' && $token == $secret && $sno != '') {
        $res = $db->query("select u.*,s.*,x.*,x.long_name,x.unit_subhead,p.unit_id as unit_id,p.scale_id as scale_id,p.job_id,p.staff_group,j.type as staff_type,j.title as jobtitle,r.desc as privilege from user u left join staff s on u.staff_no = s.staff_no left join user_roles r on r.role = u.role left join promotion p on p.id = s.promo_id left join job j on p.job_id = j.id left join unit x on p.unit_id = x.id where s.staff_no = '${sno}' and u.active = '1'");
        if ($res->num_rows > 0) {
            $row = $res->fetch_array();
            $hasAsset = false;

            $sno = $row['staff_no'];
            $uhead = $db->query("select * from hr.unit where unit_head = " . $sno);
            $unithd = $uhead->fetch_array();
            if (!empty($unithd)) {
                $_SESSION['uhead'] = $unithd['level'];
            }


            $as = $db->query("select staff_id from asset_db2.staff_accommodation where staff_id <> 0 and staff_id = " . $row['staff_no']);
            if ($as->num_rows > 0) {
                $row['hasAsset'] = true;
            } else {
                $row['hasAsset'] = $hasAsset;
            }
            $roles = explode(',', $row['roles']);
            if (is_countable($roles) && count($roles) > 0) {
                foreach ($roles as $r) {
                    if ($r == '03' || $r == '04') {
                        $row['role'] = $r;
                        break;
                    }
                }
            }
            // If Staff is Sub-head (award head privileges)
            $row['issubhead'] = (!is_null($row['unit_subhead']) && $row['unit_subhead'] == $row['staff_no']) ? true : false;
            if ($row['issubhead']) $row['role'] = '04';
            // Check Photo Existence
            //$row['photo'] = isPhoto($row['photo']);
            $row['photo'] = 'https://cdn.ucc.edu.gh/photos/?tag=' . $row['staff_no'];
            // Initialise Session
            $_SESSION['user'] = $row;
            $app->redirect($app->urlFor('index'));
        } else {
            $app->flash('error', 'You dont have the privilege required!');
            $app->redirect($app->urlFor('login'));
        }
    } else {
        $app->flash('error', 'You dont have the privilege !');
        $app->redirect($app->urlFor('login'));
    }
})->name('hrmsapp');


/* Google Provider */

$app->get('/gauth', function () use ($app) {
    $authUrl = $app->client->createAuthUrl();
    $app->redirect($authUrl);
})->name('gauth');

/*
$app->get('/sauth', function () use ($app) {
    var_dump($app->request()->get('code'));
    var_dump($app->client);
    var_dump($_SESSION['access_token']);
    require './config/db.php';
    if(isset($_SESSION['access_token'])){  
       $app->client = setAccessToken($_SESSION['access_token']);
    }else if(!is_null($app->request()->get('code'))) {
       $code = $app->request()->get('code');
       $app->client->authenticate($code);
       $_SESSION['access_token'] = $app->client->fetchAccessTokenWithAuthCode($code);
    }else{
       $app->flash('error', 'Authentication failed, Please try again!');
       $app->redirect($app->urlFor('login'));
       exit;
    }

    try{
         $oAuth = new Google_Service_Oauth2($app->client);
         //$userData = $oAuth->userinfo_v2_me->get();
         //$email = $userData['email']
         $userData = $oAuth->userinfo->get();
         $email = $userData->email;
         // Confirm User
         $res = $db->query("select u.*,s.*,x.*,p.unit_id,p.scale_id,p.job_id,p.staff_group,j.type as staff_type,j.title as jobtitle,r.desc as privilege from user u left join staff s on u.staff_no = s.staff_no left join user_roles r on r.role = u.role left join promotion p on p.id = s.promo_id left join job j on p.job_id = j.id left join unit x on p.unit_id = x.id where u.active = '1' and (s.ucc_mail <> '' or s.ucc_mail IS NOT NULL) and s.ucc_mail = trim('".$email."')");
         if($res->num_rows > 0){
            $row = $res->fetch_array();
            $hasAsset = false;
            $as = $db->query("select staff_id from asset_db2.staff_accommodation where staff_id <> 0 and staff_id = ".$row['staff_no']);
            if($as->num_rows > 0){ $row['hasAsset'] = true; }else{ $row['hasAsset'] = $hasAsset; }
            $roles = explode(',',$row['roles']);
            if(is_countable($roles) && count($roles) > 0){ foreach($roles as $r){ if($r == '03' || $r == '04'){$row['role'] = $r;break;} }}
            // If Staff is Sub-head (award head privileges)
            $row['issubhead'] = (!is_null($row['unit_subhead']) && $row['unit_subhead'] == $row['staff_no']) ? true : false;
            if($row['issubhead']) $row['role'] = '04';
            // Check Photo Existence
            $row['photo'] = isPhoto($row['photo']);
            // Initialise Session
            $_SESSION['user'] = $row;
            $app->redirect($app->urlFor('index'));
         }else{
            $app->flash('error', 'Authentication failed, Update your Email with DHR!');
            $app->redirect($app->urlFor('login'));
         }  

    } catch(Exception $e){
       echo 'You cant connect with Google Authention now! Please use SSO Authentication!  <a href="/login"> Back To Login</a>';
    }
})->name('sauth');
*/

$app->get('/sauth', function () use ($app) {

    // create Client Request to access Google API
    $cl = new Google_Client();
    $cl->setAuthConfig('./config/google_token.json');
    //$cl->setClientId($clientID);
    //$cl->setClientSecret($clientSecret);
    $cl->setRedirectUri($app->redirectUrl);
    $cl->addScope("email");
    $cl->addScope("profile");
    $cl->setAccessType('offline');
    $cl->setHostedDomain('ucc.edu.gh');
    $cl->setPrompt('select_account');
    require './config/db.php';
    // authenticate code from Google OAuth Flow
    $code = $app->request()->get('code');
    if (isset($code)) {
        $token = $cl->fetchAccessTokenWithAuthCode($code);
        $cl->setAccessToken($token['access_token']);
        // get profile info
        $google_oauth = new Google_Service_Oauth2($cl);
        $google_account_info = $google_oauth->userinfo->get();
        $email =  $google_account_info->email;
        $name =  $google_account_info->name;
        //var_dump($email);// var_dump($db);exit;
        if (isset($email)) {
            // Confirm User
            $res = $db->query("select u.*,s.*,x.*,p.unit_id,p.scale_id,p.job_id,p.staff_group,j.type as staff_type,j.title as jobtitle,r.desc as privilege from user u left join staff s on u.staff_no = s.staff_no left join user_roles r on r.role = u.role left join promotion p on p.id = s.promo_id left join job j on p.job_id = j.id left join unit x on p.unit_id = x.id where u.active = '1' and (s.ucc_mail <> '' or s.ucc_mail IS NOT NULL) and s.ucc_mail = trim('" . $email . "')");
            //var_dump($email); var_dump($res->num_rows);exit;



            if ($res->num_rows > 0) {
                $row = $res->fetch_array();
                $hasAsset = false;

                $sno = $row['staff_no'];
                $uhead = $db->query("select t1.level, t3.type from hr.unit as t1
left join staff as t2 on t2.staff_no = t1.unit_head or t2.staff_no = t1.unit_subhead
left join job as t3 on t2.job_id = t3.id
where t2.staff_no = " . $sno);
                $unithd = $uhead->fetch_array();
                if (!empty($unithd)) {
                    $_SESSION['uhead'] = $unithd['level'];
                    $_SESSION['headtype'] = $unithd['type'];
                }
                $as = $db->query("select staff_id from asset_db2.staff_accommodation where staff_id <> 0 and staff_id = " . $row['staff_no']);
                if ($as->num_rows > 0) {
                    $row['hasAsset'] = true;
                } else {
                    $row['hasAsset'] = $hasAsset;
                }
                $roles = explode(',', $row['roles']);
                if (is_countable($roles) && count($roles) > 0) {
                    foreach ($roles as $r) {
                        if ($r == '03' || $r == '04') {
                            $row['role'] = $r;
                            break;
                        }
                    }
                }
                // If Staff is Sub-head (award head privileges)
                $row['issubhead'] = (!is_null($row['unit_subhead']) && $row['unit_subhead'] == $row['staff_no']) ? true : false;
                if ($row['issubhead']) $row['role'] = '04';
                // Check Photo Existence
                //$row['photo'] = isPhoto($row['photo']);
                $row['photo'] = 'https://cdn.ucc.edu.gh/photos/?tag=' . $row['staff_no'];
                // Initialise Session
                $_SESSION['user'] = $row;
                $app->redirect($app->urlFor('index'));
            } else {
                $app->flash('error', 'Authentication failed, Update your Email with DHR!');
                $app->redirect($app->urlFor('login'));
            }
        } else {
            $app->flash('error', 'Authentication failed, Please check network connection!');
            $app->redirect($app->urlFor('login'));
        }
    } else {
        $app->flash('error', 'Authentication failed, Please try again!');
        $app->redirect($app->urlFor('login'));
    }
})->name('sauth');
