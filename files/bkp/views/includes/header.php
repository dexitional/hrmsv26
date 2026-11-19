<?php if(!isset($_SESSION)){session_start();}?>
<!DOCTYPE html>
<!--
Template Name: University Staff Portal @2020
Author: Ebenezer Kwabena Blay Ackah
Website: http://ucc.edu.gh/
Contact: ebenezer.ackah@ucc.edu.gh

-->
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
    <link rel="apple-touch-icon" href="../../public/images/logo/apple-icon-152x152.png">
    <link rel="shortcut icon" type="image/x-icon" href="../../public/images/logo/favicon-32x32.png">


    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <!-- BEGIN: VENDOR CSS-->
    <link rel="stylesheet" type="text/css" href="../../public/plugins/vendors.min.css">
    <link rel="stylesheet" type="text/css" href="../../public/plugins/animate-css/animate.css">
    <link rel="stylesheet" type="text/css" href="../../public/plugins/chartist-js/chartist.min.css">
    <link rel="stylesheet" type="text/css" href="../../public/plugins/chartist-js/chartist-plugin-tooltip.css">
    <!-- END: VENDOR CSS-->
    <!-- BEGIN: Page Level CSS-->
    <link rel="stylesheet" type="text/css" href="../../public/css/themes/vertical-menu-nav-dark-template/materialize.min.css">
    <link rel="stylesheet" type="text/css" href="../../public/css/themes/vertical-menu-nav-dark-template/style.min.css">
    <link rel="stylesheet" type="text/css" href="../../public/css/pages/dashboard-modern.css">
    <link rel="stylesheet" type="text/css" href="../../public/css/pages/intro.min.css">
    <link rel="stylesheet" type="text/css" href="../../public/css/pages/pricing.min.css">
    <!-- Conditional Pages -->
    <link rel="stylesheet" type="text/css" href="../../public/css/pages/app-invoice.min.css"> <!-- Notification Page -->
    <link rel="stylesheet" type="text/css" href="../../public/css/pages/data-tables.min.css">
    <link rel="stylesheet" href="../../public/plugins/select2/select2.min.css" type="text/css">
    <link rel="stylesheet" href="../../public/plugins/select2/select2-materialize.css" type="text/css">
    <link rel="stylesheet" type="text/css" href="../../public/plugins/data-tables/css/jquery.dataTables.min.css">
    <link rel="stylesheet" type="text/css" href="../../public/plugins/data-tables/extensions/responsive/css/responsive.dataTables.min.css">
    <!-- <link rel="stylesheet" type="text/css" href="../../public/plugins/data-tables/css/dataTables.checkboxes.css"> -->
    <link rel="stylesheet" type="text/css" href="../../public/plugins/data-tables/css/select.dataTables.min.css">
   
    <!-- END: Page Level CSS-->
    <!-- BEGIN: Custom CSS-->
    <link rel="stylesheet" type="text/css" href="../../public/css/custom/custom.css">
    <!-- END: Custom CSS-->
    <!-- <link rel="icon" href="../../public/images/ucclogo1.png" type="image/x-icon"> Favicon -->
    <link rel="stylesheet" href="../../public/plugins/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="../../public/plugins/dropzone/dropzone.css">
    <!--<link rel="stylesheet" href="../../public/plugins/bootstrap-select/css/bootstrap-select.css"/>-->
    <link rel="stylesheet" href="../../public/plugins/jvectormap/jquery-jvectormap-2.0.3.min.css"/>
    <link rel="stylesheet" href="../../public/plugins/morrisjs/morris.min.css" />
    <link rel="stylesheet" href="../../public/plugins/jquery-datatable/dataTables.bootstrap4.min.css">
    <!-- Custom Css -->
    <link rel="stylesheet" href="../../public/css/main.css">
    <link rel="stylesheet" href="../../public/css/timeline.css">
    <link rel="stylesheet" href="../../public/css/blog.css">
    <link rel="stylesheet" href="../../public/css/color_skins.css">
    <link rel="stylesheet" href="../../public/css/bootstrap-datepicker.css">
    <link rel="stylesheet" href="../../public/css/sweetalert2.css">
    <link rel="stylesheet" href="../../public/css/fileinput.css">

<style>
.bs-placeholder{
    display: none;
}
.btn-simple{
    display: none;
}
select{
  display: block;
}
/* The customcheck */
.customcheck {
    display: block;
    position: relative;
    padding-left: 35px;
    margin-bottom: 12px;
    cursor: pointer;
    font-size: 15px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

/* Hide the browser's default checkbox */
.customcheck input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
}

/* Create a custom checkbox */
.checkmark {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    height: 25px !important;
    width: 25px !important;
    background-color: #1C2473 !important;
    border-radius: 5px !important;
}

/* On mouse-over, add a grey background color */
.customcheck:hover input ~ .checkmark {
    background-color: #ccc !important;
}

/* When the checkbox is checked, add a blue background */
.customcheck input:checked ~ .checkmark {
    background-color: #1C2473 !important;
    border-radius: 5px !important;
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
    content: "" !important;
    position: absolute !important;
    display: none !important;
}

/* Show the checkmark when checked */
.customcheck input:checked ~ .checkmark:after {
    display: block !important;
}

/* Style the checkmark/indicator */
.customcheck .checkmark:after {
    left: 9px !important;
    top: 5px !important;
    width: 5px !important;
    height: 10px !important;
    border: solid white !important;
    border-width: 0 3px 3px 0 !important;
    -webkit-transform: rotate(45deg) !important;
    -ms-transform: rotate(45deg) !important;
    transform: rotate(45deg) !important;
}

[type="checkbox"]:checked, [type="checkbox"]:not(:checked) {
    position: relative !important;
    pointer-events: auto !important;
    opacity: 100 !important;
    /* margin-top: -90px !important; */
}

#imgtext {
  position: absolute;
  bottom: 15px;
  left: 15px;
  color: white;
  font-size: 20px;
}

.closebtn {
  position: absolute;
  top: 10px;
  right: 15px;
  color: white;
  font-size: 35px;
  cursor: pointer;
}

.funkyradio div {
  clear: both;
  overflow: hidden;
}

.funkyradio label {
  width: 100%;
  border-radius: 3px;
  border: 1px solid #D1D3D4;
  font-weight: normal;
}

.funkyradio input[type="radio"]:empty,
.funkyradio input[type="checkbox"]:empty {
  display: none;
}

.funkyradio input[type="radio"]:empty ~ label,
.funkyradio input[type="checkbox"]:empty ~ label {
  position: relative;
  line-height: 2.5em;
  text-indent: 3.25em;
  margin-top: 2em;
  cursor: pointer;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
}

.funkyradio input[type="radio"]:empty ~ label:before,
.funkyradio input[type="checkbox"]:empty ~ label:before {
  position: absolute;
  display: block;
  top: 0;
  bottom: 0;
  left: 0;
  content: '';
  width: 2.5em;
  background: #D1D3D4;
  border-radius: 3px 0 0 3px;
}

.funkyradio input[type="radio"]:hover:not(:checked) ~ label,
.funkyradio input[type="checkbox"]:hover:not(:checked) ~ label {
  color: #888;
}

.funkyradio input[type="radio"]:hover:not(:checked) ~ label:before,
.funkyradio input[type="checkbox"]:hover:not(:checked) ~ label:before {
  content: '\2714';
  text-indent: .9em;
  color: #C2C2C2;
}

.funkyradio input[type="radio"]:checked ~ label,
.funkyradio input[type="checkbox"]:checked ~ label {
  color: #777;
}

.funkyradio input[type="radio"]:checked ~ label:before,
.funkyradio input[type="checkbox"]:checked ~ label:before {
  content: '\2714';
  text-indent: .9em;
  color: #333;
  background-color: #ccc;
}

.funkyradio input[type="radio"]:focus ~ label:before,
.funkyradio input[type="checkbox"]:focus ~ label:before {
  box-shadow: 0 0 0 3px #999;
}

.funkyradio-default input[type="radio"]:checked ~ label:before,
.funkyradio-default input[type="checkbox"]:checked ~ label:before {
  color: #333;
  background-color: #ccc;
}

.funkyradio-primary input[type="radio"]:checked ~ label:before,
.funkyradio-primary input[type="checkbox"]:checked ~ label:before {
  color: #fff;
  background-color: #337ab7;
}

.funkyradio-success input[type="radio"]:checked ~ label:before,
.funkyradio-success input[type="checkbox"]:checked ~ label:before {
  color: #fff;
  background-color: #5cb85c;
}

.funkyradio-danger input[type="radio"]:checked ~ label:before,
.funkyradio-danger input[type="checkbox"]:checked ~ label:before {
  color: #fff;
  background-color: #d9534f;
}

.funkyradio-warning input[type="radio"]:checked ~ label:before,
.funkyradio-warning input[type="checkbox"]:checked ~ label:before {
  color: #fff;
  background-color: #f0ad4e;
}

.funkyradio-info input[type="radio"]:checked ~ label:before,
.funkyradio-info input[type="checkbox"]:checked ~ label:before {
  color: #fff;
  background-color: #5bc0de;
}






.files input {
    outline: 2px dashed #92b0b3;
    outline-offset: -10px;
    -webkit-transition: outline-offset .15s ease-in-out, background-color .15s linear;
    transition: outline-offset .15s ease-in-out, background-color .15s linear;
    padding: 120px 0px 85px 35%;
    text-align: center !important;
    margin: 0;
    height: 156px;
    width: 100% !important;
}
.files input:focus{     outline: 2px dashed #92b0b3;  outline-offset: -10px;
    -webkit-transition: outline-offset .15s ease-in-out, background-color .15s linear;
    transition: outline-offset .15s ease-in-out, background-color .15s linear; border:1px solid #92b0b3;
 }
.files{ position:relative}
.color input{ background-color:#f1f1f1;}
.files:after {
    position: absolute;
    bottom: 10px;
    left: 0;  pointer-events: none;
    width: 100%;
    right: 0;
    height: 40px;
    content: " Click to Upload or drag files here. ";
    display: block;
    margin: 0 auto;
    color: #2ea591;
    font-weight: 600;
    text-transform: capitalize;
    text-align: center;
}


* {
    margin: 0;
    padding: 0
}

html {
    height: 100%
}

p {
    color: grey
}

#heading {
    text-transform: uppercase;
    color: #1C2473;
    font-weight: normal
}

#msform {
    text-align: center;
    position: relative;
    margin-top: 20px
}

#msform fieldset {
    background: white;
    border: 0 none;
    border-radius: 0.5rem;
    box-sizing: border-box;
    width: 100%;
    margin: 0;
    padding-bottom: 20px;
    position: relative
}

.form-card {
    text-align: left
}

#msform fieldset:not(:first-of-type) {
    display: none
}

@page{
	size: inherit;
}

@media print{
	*{
		/* background: transparent !important; */
		color: #000 !important;
		/* box-shadow: none !important;
		text-shadow: none !important; */
		margin: 2px !important;
		padding: 0px !important;
		outline: 0px !important;
		font-size: 15px !important;
		border: 0px !important;
	}
	.imh{
		width: auto;
		height: auto;
	}
    .check{
        display: block !important;
    }
	.sd{
	float: right !important;
	position: relative !important;
    width: 30% !important;
	margin-left: 20px !important;
	}
    .sd1{
	float: right !important;
	position: relative !important;
    width: 20% !important;
	margin-left: 5px !important;
	}
    table {
    border-collapse: collapse;
    /*border-width: 1px 0 0 1px !important;*/
	}
	th{
		height: 40px;
		font-weight: bold !important;
        color: white !important;
	}
	table,th, td {
		/*display: none;*/
        border: 1px solid black !important;
        border-width: 0 1px 1px 0 !important;
		padding: 1px !important;
		font-size: 12px !important;
    }
    .bg1{
        background-color: #D2D2D2;
    }
    .em1, .em{
	float: right !important;
	position: relative !important;
    width: 40% !important;
	margin-left: 20px !important;
	}
    .mm{
    float: right !important;
	position: relative !important;
    width: 40% !important;
	margin-left: 20px !important;
    }
    .fieldlabels{
        font-weight: bold !important;
    }
    .v-tit{
        text-transform: uppercase;
        background-color: #eee !important;
        width: 100% !important;
        height: auto !important;
    }
	table {
    border-collapse: collapse;
    /*border-width: 1px 0 0 1px !important;*/
	}
	th{
		height: 40px;
		font-weight: bold !important;
	}
	table,th, td {
		/*display: none;*/
        border: 1px solid black !important;
        border-width: 0 1px 1px 0 !important;
		padding: 1px !important;
		font-size: 12px !important;
    }
	input,textarea{
		font-size: 12px !important;
		/*float: right !important;*/
	}
	h1{
		font-size: 25px !important;
	}
	.hd{
		font-size: 20px !important;
	}
    .hd1{
		font-size: 25px !important;
	}
    h2{
		font-size: 15px !important;
    }
	.print-container,.print-container *{
		visibility: visible;
	}
	.print-container{
		position: absolute;
		left: 0px;
	}
}


/* #msform input, */
/* #msform select, */
/* #msform textarea {
    padding: 8px 15px 8px 15px;
    border: 1px solid #ccc;
    border-radius: 0px;
    margin-bottom: 25px;
    margin-top: 2px;
    width: 100%;
    box-sizing: border-box;
    font-family: montserrat;
    color: #2C3E50;
    background-color: #ECEFF1;
    font-size: 16px;
    letter-spacing: 1px
} */

/* #msform input:focus, */
/* #msform select:focus, */
#msform textarea:focus {
    -moz-box-shadow: none !important;
    -webkit-box-shadow: none !important;
    box-shadow: none !important;
    border: 1px solid #1C2473;
    outline-width: 0
}

#msform .action-button {
    width: 100px;
    background: #1C2473;
    font-weight: bold;
    color: white;
    border: 0 none;
    border-radius: 0px;
    cursor: pointer;
    padding: 10px 5px;
    margin: 10px 0px 10px 5px;
    float: right
}

#msform .action-button:hover,
#msform .action-button:focus {
    background-color: #311B92
}

#msform .action-button-previous {
    width: 100px;
    background: #616161;
    font-weight: bold;
    color: white;
    border: 0 none;
    border-radius: 0px;
    cursor: pointer;
    padding: 10px 5px;
    margin: 10px 5px 10px 0px;
    float: right
}

#msform .action-button-previous:hover,
#msform .action-button-previous:focus {
    background-color: #000000
}

.card {
    z-index: 0;
    border: none;
    position: relative
}

.fs-title {
    font-size: 25px;
    color: #1C2473;
    margin-bottom: 15px;
    font-weight: normal;
    text-align: left
}

.purple-text {
    color: #1C2473;
    font-weight: normal
}

.steps {
    font-size: 25px;
    color: gray;
    margin-bottom: 10px;
    font-weight: normal;
    text-align: right
}

.fieldlabels {
    color: gray;
    text-align: left
}

#progressbar {
    margin-bottom: 30px;
    overflow: hidden;
    color: lightgrey
}

#progressbar .active {
    color: #1C2473
}

#progressbar li {
    list-style-type: none;
    font-size: 15px;
    width: 25%;
    float: left;
    position: relative;
    font-weight: 400
}

/* #progressbar #account:before {
    font-family: Material-Design-Iconic-Font;
    content: "\f20d"
} */

#progressbar #account:before {
    font-family: Material-Design-Iconic-Font;
    content: "\f206"
}

#progressbar #personal:before {
    font-family: Material-Design-Iconic-Font;
    content: "\f12d"
}

#progressbar #payment:before {
    font-family: Material-Design-Iconic-Font;
    content: "\f12e"
}

#progressbar #confirm:before {
    font-family: Material-Design-Iconic-Font;
    content: "\f194"
}

#progressbar li:before {
    width: 50px;
    height: 50px;
    line-height: 45px;
    display: block;
    font-size: 20px;
    color: #ffffff;
    background: lightgray;
    border-radius: 50%;
    margin: 0 auto 10px auto;
    padding: 2px
}

#progressbar li:after {
    content: '';
    width: 100%;
    height: 2px;
    background: lightgray;
    position: absolute;
    left: 0;
    top: 25px;
    z-index: -1
}

#progressbar li.active:before,
#progressbar li.active:after {
    background: #1C2473
}

.progress {
    height: 20px
}

.progress-bar {
    background-color: #1C2473
}

.fit-image {
    width: 100%;
    object-fit: cover
}

.invalidFeedback {
    color: #ff0000;
    display: block;
}

.theme-cyan .navbar{
  background:linear-gradient(45deg, #263b73, #1d2473) !important;
}

.breadcrumb .breadcrumb-item a{
  color:#d3242c !important;
}

.btn-primary{
  background:#d3242c !important;
}

.bg-primary{
  background:#263b73 !important;
}

.txt{
  color: #263b73 !important;
}

</style>

  </head>
  <!-- END: Head-->
  <body class="vertical-layout page-header-light vertical-menu-collapsible vertical-menu-nav-dark preload-transitions 2-columns" data-open="click" data-menu="vertical-menu-nav-dark" data-col="2-columns">

    <!-- BEGIN: Header-->
    <header class="page-topbar" id="header">
      <div class="navbar navbar-fixed"> 
        <nav class="navbar-main navbar-color nav-collapsible sideNav-lock navbar-dark gradient-shadow gradient-45deg-indigo-blue">
          <div class="nav-wrapper">
            <div class="header-search-wrapper hide-on-med-and-down"><i class="material-icons hide">search</i>
              <input class="header-search-input z-depth-2" type="text" name="Search" placeholder="<?= $_SESSION['user']['fname'].' '.$_SESSION['user']['mname'].' '.$_SESSION['user']['lname'] ?> ( <?= $_SESSION['user']['staff_no'] ?> ) - <?= $_SESSION['user']['jobtitle'] ?>" value="<?= $_SESSION['user']['fname'].' '.$_SESSION['user']['mname'].' '.$_SESSION['user']['lname'] ?> ( <?= $_SESSION['user']['staff_no'] ?> ) - <?= $_SESSION['user']['jobtitle'] ?>" data-search="template-list" disabled>
              <ul class="search-list collection display-none"></ul>
            </div>
            <ul class="navbar-list right header-dropdown">
              <li class="hide-on-med-and-down"><a class="waves-effect waves-block waves-light toggle-fullscreen" href="javascript:void(0);"><i class="material-icons">settings_overscan</i></a></li>
              <li class="hide-on-large-only search-input-wrapper"><a class="waves-effect waves-block waves-light search-button" href="javascript:void(0);"><i class="material-icons">search</i></a></li>
              <!--<li><a class="waves-effect waves-block waves-light notification-button" href="javascript:void(0);" data-target="notifications-dropdown"><i class="material-icons">notifications_none<small class="notification-badge">0</small></i></a></li>-->
              <!-- <li><a class="waves-effect waves-block waves-light profile-button" href="javascript:void(0);" data-target="profile-dropdown"> -->
              <!-- <span class="avatar-status avatar-online"><img src="<?= $_SESSION['user']['photo'] ?>" alt="avatar"><i></i></span></a></li> -->

              <li class="dropdown"> <a href="javascript:void(0);" class="dropdown-toggle" data-toggle="dropdown" 
              role="button" aria-haspopup="true" aria-expanded="false"> 
              <span class="avatar-status avatar-online"><img src="<?= $_SESSION['user']['photo'] ?>" alt="avatar"><i></i></span></a>
                  <ul class="dropdown-menu dropdown-menu-right slideUp float-right">
                      <li><a class="grey-text text-darken-1" href="profile"><i class="zmdi zmdi-account"> Profile</i> </a></li>
                      <li><a class="grey-text text-darken-1" href="https://oauth.ucc.edu.gh/reset?return_url=http://staffportal.com"><i class="zmdi zmdi-refresh"> Reset</i></a></li>
                      <li><a class="grey-text text-darken-1" href="logout" onclick="return confirm('You are being logged out of your session?')"><i class="zmdi zmdi-power"> Logout</i> </a></li>
                      <!-- <li><a href="javascript:void(0);">Action</a></li>
                      <li><a href="javascript:void(0);">Another action</a></li>
                      <li><a href="javascript:void(0);">Something else</a></li> -->
                  </ul>
              </li>
              <li ><img src="../../public/images/logo/logo.png" class="ucc_logo"/></li>
              
            </ul>
            <!-- notifications-dropdown-->
            <ul class="dropdown-content" id="notifications-dropdown">
              <li>
                <h6>NOTIFICATIONS<span class="new badge">5</span></h6>
              </li>
              <li class="divider"></li>
              <li><a class="black-text" href="#!"><span class="material-icons icon-bg-circle cyan small">add_shopping_cart</span> A new order has been placed!</a>
                <time class="media-meta grey-text darken-2" datetime="2015-06-12T20:50:48+08:00">2 hours ago</time>
              </li>
            </ul>
            <!-- profile-dropdown-->
            <ul class="dropdown-content" id="profile-dropdown">
              <li><a class="grey-text text-darken-1" href="profile"><i class="material-icons">person_outline</i> Profile</a></li>
              <li><a class="grey-text text-darken-1" href="https://oauth.ucc.edu.gh/reset?return_url=http://staffportal.com"><i class="material-icons">lock</i> Reset</a></li>
              <!--<li><a class="grey-text text-darken-1" href="app-chat.html"><i class="material-icons">chat_bubble_outline</i> Chat</a></li>
              <li><a class="grey-text text-darken-1" href="page-faq.html"><i class="material-icons">help_outline</i> Help</a></li>
              <li class="divider"></li>
              <li><a class="grey-text text-darken-1" href="user-lock-screen.html"><i class="material-icons">lock_outline</i> Lock</a></li>-->
              <li><a class="grey-text text-darken-1" href="logout" onclick="return confirm('You are being logged out of your session?')"><i class="material-icons">keyboard_tab</i> Logout</a></li>
            </ul>
          </div>
          <nav class="display-none search-sm">
            <div class="nav-wrapper">
              <form id="navbarForm">
                <div class="input-field search-input-sm">
                  <input class="search-box-sm mb-0" type="search" required="" id="search" placeholder="Explore Materialize" data-search="template-list">
                  <label class="label-icon" for="search"><i class="material-icons search-sm-icon">search</i></label><i class="material-icons search-sm-close">close</i>
                  <ul class="search-list collection search-list-sm display-none"></ul>
                </div>
              </form>
            </div>
          </nav>
        </nav>
      </div>
    </header>
    <!-- END: Header-->
    
    <ul class="display-none" id="default-search-main">
      <li class="auto-suggestion-title"><a class="collection-item" href="#">
          <h6 class="search-title">FILES</h6></a></li>
      <li class="auto-suggestion"><a class="collection-item" href="#">
          <div class="display-flex">
            <div class="display-flex align-item-center flex-grow-1">
              <div class="avatar"><img src="../../public/images/icon/pdf-image.png" width="24" height="30" alt="sample image"></div>
              <div class="member-info display-flex flex-column"><span class="black-text">Two new item submitted</span><small class="grey-text">Marketing Manager</small></div>
            </div>
            <div class="status"><small class="grey-text">17kb</small></div>
          </div></a></li>
      <li class="auto-suggestion"><a class="collection-item" href="#">
          <div class="display-flex">
            <div class="display-flex align-item-center flex-grow-1">
              <div class="avatar"><img src="../../public/images/icon/doc-image.png" width="24" height="30" alt="sample image"></div>
              <div class="member-info display-flex flex-column"><span class="black-text">52 Doc file Generator</span><small class="grey-text">FontEnd Developer</small></div>
            </div>
            <div class="status"><small class="grey-text">550kb</small></div>
          </div></a></li>
      <li class="auto-suggestion"><a class="collection-item" href="#">
          <div class="display-flex">
            <div class="display-flex align-item-center flex-grow-1">
              <div class="avatar"><img src="../../public/images/icon/xls-image.png" width="24" height="30" alt="sample image"></div>
              <div class="member-info display-flex flex-column"><span class="black-text">25 Xls File Uploaded</span><small class="grey-text">Digital Marketing Manager</small></div>
            </div>
            <div class="status"><small class="grey-text">20kb</small></div>
          </div></a></li>
      <li class="auto-suggestion"><a class="collection-item" href="#">
          <div class="display-flex">
            <div class="display-flex align-item-center flex-grow-1">
              <div class="avatar"><img src="../../public/images/icon/jpg-image.png" width="24" height="30" alt="sample image"></div>
              <div class="member-info display-flex flex-column"><span class="black-text">Anna Strong</span><small class="grey-text">Web Designer</small></div>
            </div>
            <div class="status"><small class="grey-text">37kb</small></div>
          </div></a></li>
      <li class="auto-suggestion-title"><a class="collection-item" href="#">
          <h6 class="search-title">MEMBERS</h6></a></li>
      <li class="auto-suggestion"><a class="collection-item" href="#">
          <div class="display-flex">
            <div class="display-flex align-item-center flex-grow-1">
              <div class="avatar"><img class="circle" src="../../public/images/avatar/avatar-7.png" width="30" alt="sample image"></div>
              <div class="member-info display-flex flex-column"><span class="black-text">John Doe</span><small class="grey-text">UI designer</small></div>
            </div>
          </div></a></li>
      <li class="auto-suggestion"><a class="collection-item" href="#">
          <div class="display-flex">
            <div class="display-flex align-item-center flex-grow-1">
              <div class="avatar"><img class="circle" src="../../public/images/avatar/avatar-8.png" width="30" alt="sample image"></div>
              <div class="member-info display-flex flex-column"><span class="black-text">Michal Clark</span><small class="grey-text">FontEnd Developer</small></div>
            </div>
          </div></a></li>
      <li class="auto-suggestion"><a class="collection-item" href="#">
          <div class="display-flex">
            <div class="display-flex align-item-center flex-grow-1">
              <div class="avatar"><img class="circle" src="../../public/images/avatar/avatar-10.png" width="30" alt="sample image"></div>
              <div class="member-info display-flex flex-column"><span class="black-text">Milena Gibson</span><small class="grey-text">Digital Marketing</small></div>
            </div>
          </div></a></li>
      <li class="auto-suggestion"><a class="collection-item" href="#">
          <div class="display-flex">
            <div class="display-flex align-item-center flex-grow-1">
              <div class="avatar"><img class="circle" src="../../public/images/avatar/avatar-12.png" width="30" alt="sample image"></div>
              <div class="member-info display-flex flex-column"><span class="black-text">Anna Strong</span><small class="grey-text">Web Designer</small></div>
            </div>
          </div></a></li>
    </ul>
    <ul class="display-none" id="page-search-title">
      <li class="auto-suggestion-title"><a class="collection-item" href="#">
          <h6 class="search-title">PAGES</h6></a></li>
    </ul>
    <ul class="display-none" id="search-not-found">
      <li class="auto-suggestion"><a class="collection-item display-flex align-items-center" href="#"><span class="material-icons">error_outline</span><span class="member-info">No results found.</span></a></li>
    </ul>