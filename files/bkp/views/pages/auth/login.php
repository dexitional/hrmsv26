<!DOCTYPE html>

<html class="loading" lang="en" data-textdirection="ltr">
  <!-- BEGIN: Head-->
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, minimal-ui">
    <meta name="description" content="University of Cape Coast Staff Portal">
    <meta name="keywords" content="UCC-SSO, Staff Portal, USP, UNiversity Staff Portal - UCC, University of Cape Coast, HRMS, Human Resorce Management System, ">
    <meta name="author" content="Ebenezer Kwabena Blay Ackah">
    <title>USP | University Staff Portal</title>
    <link rel="apple-touch-icon" href="public/images/logo/apple-icon-152x152.png">
    <link rel="shortcut icon" type="image/x-icon" href="public/images/logo/favicon-32x32.png">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <!-- BEGIN: VENDOR CSS-->
    <link rel="stylesheet" type="text/css" href="public/pluins/vendors.min.css">
    <!-- END: VENDOR CSS-->
    <!-- BEGIN: Page Level CSS-->
    <link rel="stylesheet" type="text/css" href="public/css/themes/vertical-menu-nav-dark-template/materialize.min.css">
    <link rel="stylesheet" type="text/css" href="public/css/themes/vertical-menu-nav-dark-template/style.min.css">
    <link rel="stylesheet" type="text/css" href="public/css/pages/login.css">
    <!-- END: Page Level CSS-->
    <!-- BEGIN: Custom CSS-->
    <link rel="stylesheet" type="text/css" href="public/css/custom/custom.css">
    <!-- END: Custom CSS-->
    <script type="text/javascript">
        var rumMOKey='33ef80a19fa1293e5e4f3819802514f0';
        (function(){
        if(window.performance && window.performance.timing && window.performance.navigation) {
          var site24x7_rum_beacon=document.createElement('script');
          site24x7_rum_beacon.async=true;
          site24x7_rum_beacon.setAttribute('src','//static.site24x7rum.com/beacon/site24x7rum-min.js?appKey='+rumMOKey);
          document.getElementsByTagName('head')[0].appendChild(site24x7_rum_beacon);
        }
        })(window)
    </script>
  </head>
  <!-- END: Head-->
  <body class="vertical-layout page-header-light vertical-menu-collapsible vertical-menu-nav-dark preload-transitions 1-column login-bg   blank-page blank-page" data-open="click" data-menu="vertical-menu-nav-dark" data-col="1-column">
    <div class="row">
      <div class="col s12">
        <div class="container"><div id="login-page" class="row">
  <div class="col s12 m6 l4 z-depth-4 card-panel border-radius-6 login-card bg-opacity-8" style="width:400px">
    <form class="login-form" action="<?= $app->urlFor('postlogin') ?>" method="post">
      <div class="row">
        <div class="input-field col s12" style="margin-bottom:0px;">
          <h5 class="ml-4 red-text text-darken-4">UNIVERSITY STAFF PORTAL</h5><hr>
        </div>
        <center class="mlogo z-depth-2 mb-2" style="margin:0;padding:3px;border-radius:0 0 5px 5px;">
            <img src="public/images/logo/logo.png" style="height:100px;background:#fff;border-radius:0 0 50px 50px;padding:8px;border:4px solid #273875">
        </center>
      </div>
      <?php if(isset($_SESSION['slim.flash']['error'])){ ?>
           <div class="card-alert card red lighten-5 center border-round" id="msg">
                <div class="card-content red-text">
                    <small><b><?= strtoupper($_SESSION['slim.flash']['error']); ?></b></small>
                </div>
                <button type="button" class="close red-text" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
            </div>
      <?php } ?>
      
     
      <div class="row mb-6 glogin">
       
        <div class="input-field col s12 gbtn mb-2" style="margin-bottom:0px;">
          <a class="btn-large waves-effect waves-light border-round red darken-4 col s12" href="<?= $app->urlFor('gauth') ?>"><i class="material-icons">g_translate</i>&nbsp;&nbsp;&nbsp;<b style="font-size:18px;">SIGNIN WITH GOOGLE</b></a>
        </div>
        <div class="input-field col s12 cbtn">
          <a class="btn-large waves-effect waves-light border-round light-blue darken-4 col s12" ><i class="material-icons">login</i>&nbsp;&nbsp;&nbsp;<b style="font-size:18px;">SIGNIN WITH UCC-SSO </b></a>
        </div>
        <div class="input-field col s12">
          <a href="https://oauth.ucc.edu.gh/reset?return_url=https://staffportal.ucc.edu.gh" class="btn waves-effect waves-light border-round light-blue darken-4 col s12" ><i class="material-icons">vpn_key</i>&nbsp;&nbsp;&nbsp;<b style="font-size:13px;">RESET UCC-SSO / EDUROAM PASSWORD</b></a>
        </div>
      </div>

      <div class="row mb-6">
       <div class="col s12 center-align"><hr><small><b>© <?= date('Y') ?> MIS-DICTS, All rights reserved.</b></small></div>
      </div>


    </form>
    
    <div class="row margin clogin">
      <form class="login-form" action="<?= $app->urlFor('postlogin1') ?>" method="post">
    <div class="row margin">
        <div class="input-field col s12 red-text text-darken-3" style="margin-bottom:0px;">
          <i class="material-icons prefix pt-2">alternate_email</i>
          <input id="username" type="text" name="username" class="red-text text-darken-3">
          <label for="username"  class="center-align light-blue-text text-darken-4"><b>STAFF NUMBER</b></label>
        </div>
      </div>
      <div class="row margin">
        <div class="input-field col s12 red-text text-darken-3" style="margin-bottom:0px;">
          <i class="material-icons prefix pt-2 red-text text-darken-3">lock_outline</i>
          <input id="password" name="password" type="password" class="red-text text-darken-3">
          <label for="password" class="light-blue-text text-darken-4"><b> PASSWORD</b></label>
        </div>
      </div>

      <div class="row mb-6">
        <div class="input-field col s12 l6 m6 mb-0" >
            <button class="btn waves-effect waves-light border-round light-blue darken-4 col s12" type="submit"><b>LOGIN</b></button>
        </div>
        <div class="input-field col s12 l6 m6 bbtn">
        <a class="btn waves-effect waves-light border-round red darken-4 col s12"><b>BACK</b></a>
        </div>
      </div>
    </form>
      </div>
  </div>
</div>
        </div>
        <div class="content-overlay"></div>
      </div>
    </div>

    <!-- BEGIN VENDOR JS-->
    <script src="public/js/vendors.min.js"></script>
    <!-- BEGIN VENDOR JS-->
    <!-- BEGIN PAGE VENDOR JS-->
    <!-- END PAGE VENDOR JS-->
    <!-- BEGIN THEME  JS-->
    <script src="public/js/plugins.min.js"></script>
    <script src="public/js/search.min.js"></script>
    <script src="public/js/main.js"></script>
    <!-- END THEME  JS-->
    <!-- BEGIN PAGE LEVEL JS-->
    <!-- END PAGE LEVEL JS-->
  </body>
</html>