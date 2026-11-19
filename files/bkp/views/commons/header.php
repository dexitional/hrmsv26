<?php if (!isset($_SESSION)) {
    session_start();
} ?>
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
    <meta name="author" content="Ebenezer Kwabena Blay Ackah & Nketia Gyamfi Richmond">
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
    <link rel="stylesheet" type="text/css" href="../../public/plugins/data-tables/css/dataTables.checkboxes.css">
    <link rel="stylesheet" type="text/css" href="../../public/plugins/data-tables/css/select.dataTables.min.css">
    <link rel="stylesheet" href="../../public/css/timeline.css">
    <link rel="stylesheet" href="../../public/css/font-awesome/css/all.css">

    <!-- <link rel="stylesheet" href="../../public/plugins/bootstrap/css/bootstrap.min.css"> -->

    <!-- END: Page Level CSS-->
    <!-- BEGIN: Custom CSS-->
    <link rel="stylesheet" type="text/css" href="../../public/css/custom/custom.css">
    <link rel="stylesheet" href="../../public/css/sweetalert2.css">
    <!-- <script src="https://cdn.ckeditor.com/4.16.2/standard/ckeditor.js"></script> -->
        <script src="https://cdn.ckeditor.com/ckeditor5/34.2.0/classic/ckeditor.js"></script>
    <!-- <link rel="stylesheet" href="../../public/css/fileinput.css"> -->
    <!-- END: Custom CSS-->

</head>
<!-- END: Head-->

<body class="vertical-layout page-header-light vertical-menu-collapsible vertical-menu-nav-dark preload-transitions 2-columns" data-open="click" data-menu="vertical-menu-nav-dark" data-col="2-columns">

    <!-- BEGIN: Header-->
    <header class="page-topbar" id="header">
        <div class="navbar navbar-fixed">
            <nav class="navbar-main navbar-color nav-collapsible sideNav-lock navbar-dark gradient-shadow gradient-45deg-indigo-blue">
                <div class="nav-wrapper">
                    <div class="header-search-wrapper hide-on-med-and-down"><i class="material-icons hide">search</i>
                        <input class="header-search-input z-depth-2" type="text" name="Search" placeholder="<?= $_SESSION['user']['fname'] . ' ' . $_SESSION['user']['mname'] . ' ' . $_SESSION['user']['lname'] ?> ( <?= $_SESSION['user']['staff_no'] ?> ) - <?= $_SESSION['user']['jobtitle'] ?>" value="<?= $_SESSION['user']['fname'] . ' ' . $_SESSION['user']['mname'] . ' ' . $_SESSION['user']['lname'] ?> ( <?= $_SESSION['user']['staff_no'] ?> ) - <?= $_SESSION['user']['jobtitle'] ?>" data-search="template-list" disabled>
                        <ul class="search-list collection display-none"></ul>
                    </div>
                    <ul class="navbar-list right">
                        <li class="hide-on-med-and-down"><a class="waves-effect waves-block waves-light toggle-fullscreen" href="javascript:void(0);"><i class="material-icons">settings_overscan</i></a></li>
                        <li class="hide-on-large-only search-input-wrapper"><a class="waves-effect waves-block waves-light search-button" href="javascript:void(0);"><i class="material-icons">search</i></a></li>
                        <!--<li><a class="waves-effect waves-block waves-light notification-button" href="javascript:void(0);" data-target="notifications-dropdown"><i class="material-icons">notifications_none<small class="notification-badge">0</small></i></a></li>-->
                        <li><a class="waves-effect waves-block waves-light profile-button" href="javascript:void(0);" data-target="profile-dropdown">
                                <span class="avatar-status avatar-online"><img src="<?= $_SESSION['user']['photo'] ?>" alt="avatar"><i></i></span></a></li>
                        <li><img src="../../public/images/logo/logo.png" class="ucc_logo" /></li>

                    </ul>

                    <!-- notifications-dropdown-->
                    <ul class="dropdown-content" id="notifications-dropdown">
                        <li>
                            <h6>NOTIFICATIONS<span class="new badge">5</span></h6>
                        </li>
                        <li class="divider"></li>
                        <li><a class="black-text" href="#!"><span class="material-icons icon-bg-circle cyan small">add_shopping_cart</span> A new
                                order has been placed!</a>
                            <time class="media-meta grey-text darken-2" datetime="2015-06-12T20:50:48+08:00">2 hours
                                ago</time>
                        </li>
                    </ul>
                    <!-- profile-dropdown-->
                    <ul class="dropdown-content" id="profile-dropdown">
                        <li><a class="grey-text text-darken-1" href="profile"><i class="material-icons">person_outline</i> Profile</a></li>
                        <li><a class="grey-text text-darken-1" href="https://oauth.ucc.edu.gh/reset?return_url=http://localhost:8500"><i class="material-icons">lock</i> Reset</a></li>
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
                <h6 class="search-title">FILES</h6>
            </a></li>
        <li class="auto-suggestion"><a class="collection-item" href="#">
                <div class="display-flex">
                    <div class="display-flex align-item-center flex-grow-1">
                        <div class="avatar"><img src="../../public/images/icon/pdf-image.png" width="24" height="30" alt="sample image"></div>
                        <div class="member-info display-flex flex-column"><span class="black-text">Two new item
                                submitted</span><small class="grey-text">Marketing Manager</small></div>
                    </div>
                    <div class="status"><small class="grey-text">17kb</small></div>
                </div>
            </a></li>
        <li class="auto-suggestion"><a class="collection-item" href="#">
                <div class="display-flex">
                    <div class="display-flex align-item-center flex-grow-1">
                        <div class="avatar"><img src="../../public/images/icon/doc-image.png" width="24" height="30" alt="sample image"></div>
                        <div class="member-info display-flex flex-column"><span class="black-text">52 Doc file
                                Generator</span><small class="grey-text">FontEnd Developer</small></div>
                    </div>
                    <div class="status"><small class="grey-text">550kb</small></div>
                </div>
            </a></li>
        <li class="auto-suggestion"><a class="collection-item" href="#">
                <div class="display-flex">
                    <div class="display-flex align-item-center flex-grow-1">
                        <div class="avatar"><img src="../../public/images/icon/xls-image.png" width="24" height="30" alt="sample image"></div>
                        <div class="member-info display-flex flex-column"><span class="black-text">25 Xls File
                                Uploaded</span><small class="grey-text">Digital Marketing Manager</small></div>
                    </div>
                    <div class="status"><small class="grey-text">20kb</small></div>
                </div>
            </a></li>
        <li class="auto-suggestion"><a class="collection-item" href="#">
                <div class="display-flex">
                    <div class="display-flex align-item-center flex-grow-1">
                        <div class="avatar"><img src="../../public/images/icon/jpg-image.png" width="24" height="30" alt="sample image"></div>
                        <div class="member-info display-flex flex-column"><span class="black-text">Anna
                                Strong</span><small class="grey-text">Web Designer</small></div>
                    </div>
                    <div class="status"><small class="grey-text">37kb</small></div>
                </div>
            </a></li>
        <li class="auto-suggestion-title"><a class="collection-item" href="#">
                <h6 class="search-title">MEMBERS</h6>
            </a></li>
        <li class="auto-suggestion"><a class="collection-item" href="#">
                <div class="display-flex">
                    <div class="display-flex align-item-center flex-grow-1">
                        <div class="avatar"><img class="circle" src="../../public/images/avatar/avatar-7.png" width="30" alt="sample image"></div>
                        <div class="member-info display-flex flex-column"><span class="black-text">John Doe</span><small class="grey-text">UI designer</small></div>
                    </div>
                </div>
            </a></li>
        <li class="auto-suggestion"><a class="collection-item" href="#">
                <div class="display-flex">
                    <div class="display-flex align-item-center flex-grow-1">
                        <div class="avatar"><img class="circle" src="../../public/images/avatar/avatar-8.png" width="30" alt="sample image"></div>
                        <div class="member-info display-flex flex-column"><span class="black-text">Michal
                                Clark</span><small class="grey-text">FontEnd Developer</small></div>
                    </div>
                </div>
            </a></li>
        <li class="auto-suggestion"><a class="collection-item" href="#">
                <div class="display-flex">
                    <div class="display-flex align-item-center flex-grow-1">
                        <div class="avatar"><img class="circle" src="../../public/images/avatar/avatar-10.png" width="30" alt="sample image"></div>
                        <div class="member-info display-flex flex-column"><span class="black-text">Milena
                                Gibson</span><small class="grey-text">Digital Marketing</small></div>
                    </div>
                </div>
            </a></li>
        <li class="auto-suggestion"><a class="collection-item" href="#">
                <div class="display-flex">
                    <div class="display-flex align-item-center flex-grow-1">
                        <div class="avatar"><img class="circle" src="../../public/images/avatar/avatar-12.png" width="30" alt="sample image"></div>
                        <div class="member-info display-flex flex-column"><span class="black-text">Anna
                                Strong</span><small class="grey-text">Web Designer</small></div>
                    </div>
                </div>
            </a></li>
    </ul>
    <ul class="display-none" id="page-search-title">
        <li class="auto-suggestion-title"><a class="collection-item" href="#">
                <h6 class="search-title">PAGES</h6>
            </a></li>
    </ul>
    <ul class="display-none" id="search-not-found">
        <li class="auto-suggestion"><a class="collection-item display-flex align-items-center" href="#"><span class="material-icons">error_outline</span><span class="member-info">No results found.</span></a>
        </li>
    </ul>