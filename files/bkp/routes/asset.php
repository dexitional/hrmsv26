<?php 
if(!isset($_SESSION)){
  session_start();
}


// Individual Request
$app->get('/indivreq', 'authenticate',function () use ($app) {
   require_once './config/db.php';
   $sql = "select t1.request_id as request_id, t1.request_type as request_type, t1.description as description, t4.request_to as unit, t3.tracking_status as progress from asset_db2.request as t1 left join asset_db2.tracking_status as t3 on t1.tracking_status_id = t3.tracking_status_id left join asset_db2.request_to_unit as t4 on t1.request_to_id = t4.request_to_id where t1.login_id = ".$_SESSION['user']['staff_no']." and t1.user_delete = 0 and t1.request_type = 2 order by t1.remark_id asc, t1.tracking_status_id asc, t1.date_received asc";
   $ind_sql = $db->query($sql);
   $ind = [];
   if($ind_sql->num_rows > 0){
      while($row = $ind_sql->fetch_assoc()){
         $remark_sql = $db->query("SELECT remark_id,assigned_staff_id,tracking_status_id FROM asset_db2.request WHERE request_id =".$row['request_id']);
         if($remark_sql->num_rows > 0){
           $row['remark'] =  $remark_sql->fetch_assoc();
         }else{  
           $row['remark'] = null;
         }
         $ind[] = $row;
      }
   }  
   $app->render('mainlayout.php',[
      'page' => 'pages/asset/indivreq.php',
      'ind' => $ind,
      'slug' => 'indivreq'
   ]);
})->name('indivreq');



// Department Request
$app->get('/deptreq', 'authenticate',function () use ($app) {
   require_once './config/db.php';
   $dep_sql = $db->query("SELECT t1.request_id AS request_id, t1.request_type AS request_type, t1.description AS description, t4.request_to AS unit, t3.tracking_status AS progress FROM asset_db2.request AS t1 LEFT JOIN asset_db2.tracking_status AS t3 ON t1.tracking_status_id = t3.tracking_status_id LEFT JOIN asset_db2.request_to_unit AS t4 ON t1.request_to_id = t4.request_to_id WHERE t1.login_id = ".$_SESSION['user']['staff_no']." AND t1.user_delete = 0 AND t1.request_type = 1 ORDER BY t1.remark_id ASC, t1.tracking_status_id ASC, t1.date_received ASC");
   $dep = [];
   if($dep_sql->num_rows > 0){
      while($row = $dep_sql->fetch_assoc()){
         $remark_sql = $db->query("SELECT remark_id,assigned_staff_id,tracking_status_id FROM asset_db2.request WHERE request_id =".$row['request_id']);
         if($remark_sql->num_rows > 0){
           $row['remark'] =  $remark_sql->fetch_assoc();
         }else{  
           $row['remark'] = null;
         }
         $dep[] = $row;
      }
   }  
   $app->render('mainlayout.php',[
       'page' => 'pages/asset/deptreq.php',
       'dep' => $dep,
       'slug' => 'deptreq'
   ]);
})->name('deptreq');


// AJAX - Estate Forms
$app->get('/ajaxassetform', 'authenticate',function () use ($app) {
   require_once './config/db.php';
   $action = $app->request()->get('action');
   $type = $app->request()->get('type');
   $rid = $app->request()->get('rid');

   if($action == 'applyform'){
      # Request Form
      $sql = $db->query("select * from asset_db2.request_to_unit"); $units = [];
      if($sql->num_rows > 0){
        while($row = $sql->fetch_assoc()){ $units[] = $row; }
      }
      $app->render('pages/asset/assetform.php',[
         'action' => $action,
         'units' => $units,
         'type' => $type
      ]);

   }else if($action == 'detailview'){
      # Detail View - Assigned Staff
      $row = $db->query("select upper(date_format(r.date_assigned,'%M %d, %Y')) as date_assigned,upper(concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname)) as name,s.phone from asset_db2.request r left join staff s on r.assigned_staff_id = s.staff_no where r.request_id =".$rid)->fetch_assoc(); 
      $app->render('pages/asset/assetform.php',[
         'action' => $action,
         'units' => null,'type' => null,
         'data' => $row
      ]);

   }else if($action == 'overview'){
      # OverView of Request
      $row = $db->query("select upper(date_format(r.date_assigned,'%M %d, %Y')) as date_assigned,upper(concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname)) as name,s.phone from asset_db2.request r left join staff s on r.assigned_staff_id = s.staff_no where r.request_id =".$rid)->fetch_assoc(); 
      $app->render('pages/asset/assetform.php',[
         'action' => $action,
         'units' => null,'type' => null,
         'data' => $row
      ]);

   }else if($action == 'feedbackform'){
      # Request Form
      $sql = $db->query("select * from asset_db2.request_to_unit"); $units = [];
      if($sql->num_rows > 0){
         while($row = $sql->fetch_assoc()){ $units[] = $row; }
      }
      $app->render('pages/asset/assetform.php',[
         'action' => $action,
         'units' => $units,
         'type' => $type
      ]);
   }
});


// Send Estate Request
$app->post('/postassetreq','authenticate',function () use ($app){
   require_once './config/db.php';
   $r = $app->request();
   $request_id = ($db->query("select request_id from asset_db2.request order by request_id desc limit 1")->fetch_assoc())['request_id']+1;
   $request_to_id = $r->post('request_to_id');
   $type = $r->post('type');
   $description = $r->post('description');
   $sno = $_SESSION['user']['staff_no'];
   $dept_id = $_SESSION['user']['unit_id'];
   $sql = "insert into asset_db2.request(request_id,request_to_id,description,login_id,tracking_status_id,request_type,assigned_unit_id,user_delete,req_deleted) values(${request_id},${request_to_id},'${description}',${sno},1,${type},${dept_id},0,0)";
   $run = $db->query($sql);
   if($run){
      $app->flash('success','Leave application successful!');
   }else{
      $app->flash('error','Leave application failed!');
   }  $type == '2' ?  $app->redirect($app->urlFor('indivreq')) : $app->redirect($app->urlFor('deptreq'));  
 });



