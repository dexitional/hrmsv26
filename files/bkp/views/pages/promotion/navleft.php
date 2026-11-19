<!-- BEGIN: SideNav-->
<aside id="leftsidebar" class="sidebar sidenav-main nav-expanded nav-lock nav-collapsible sidenav-light navbar-full sidenav-active-rounded">
    <div class="brand-sidebar">
        <h1 class="logo-wrapper"><a class="brand-logo darken-1" href="profile">
                <!--<img src="public/images/logo/logo.png" alt="materialize logo" class="show-small-only"/>--><span class="logo-text hide-on-med-and-down"><em>UCC Staff Portal</em></span>
            </a>
            <!--<a class="navbar-toggler" href="#"><i class="material-icons">radio_button_checked</i></a>-->
        </h1>
    </div>
    <ul class="sidenav sidenav-collapsible leftside-navigation collapsible sidenav-fixed menu-shadow" id="slide-out" data-menu="menu-navigation" data-collapsible="menu-accordion">
        <li class="navigation-header"><a class="navigation-header-text light-blue-text text-darken-3">UCC STAFF NO - [
                <?= $_SESSION['user']['staff_group'] . ' / ' . $_SESSION['user']['staff_no'] ?> ] </a><i class="navigation-header-icon material-icons">more_horiz</i></li>

        <li class="bold <?= isset($slug) && ($slug == 'counseling' || $slug == 'ghcard_update' || $slug == 'profile' || $slug == 'eduroam') ? 'active open' : '' ?>">
            <a class="collapsible-header waves-effect waves-cyan menu-toggle" href="JavaScript:void(0)"><i class="material-icons">receipt</i><span class="menu-title" data-i18n="Invoice">PERSONAL SERVICES</span></a>
            <div class="collapsible-body">
                <ul class="collapsible collapsible-sub" data-collapsible="accordion">

                    <li class="<?= isset($slug) && $slug == 'profile'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'profile'  ? 'active indigo darken-4' : '' ?>" href="profile"><i class="material-icons">person</i><span data-i18n="Modern">STAFF PROFILE</span></a></li>
                    <li class="<?= isset($slug) && $slug == 'eduroam'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'eduroam'  ? 'active indigo darken-4' : '' ?>" href="eduroam"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Modern">EDUROAM INFO</span></a>
                    </li>
                    <li class="<?= isset($slug) && $slug == 'ghcard_update'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'ghcard_update'  ? 'active indigo darken-4' : '' ?>" href="ghcard_update"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Modern">GH
                                CARD NO</span></a></li>
                    <li class="<?= isset($slug) && $slug == 'counseling'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'counseling'  ? 'active indigo darken-4' : '' ?>" href="counseling"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Modern">COUNSELING</span></a></li>
                    <li class="<?= isset($slug) && $slug == 'xpay'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'xpay'  ? 'active indigo darken-4' : '' ?>" href="xpayreset.php?email=<?= $_SESSION['user']['ucc_mail'] ?>"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Modern">RESET XPAY
                                PASSWORD</span></a></li>

                </ul>
            </div>
        </li>

        <!--     
        <li class="bold <?= isset($slug) && ($slug == 'profile' || $slug == 'notification' || $slug == 'eduroam') ? 'active open' : '' ?>"><a class="collapsible-header waves-effect waves-cyan " href="JavaScript:void(0)"><i class="material-icons">settings_input_svideo</i>
         <span class="menu-title" data-i18n="Dashboard">DASHBOARD</span>
        <span class="badge badge pill orange float-right mr-10">3</span>
        </a>
          <div class="collapsible-body">
            <ul class="collapsible collapsible-sub" data-collapsible="accordion">
              <li class="<?= isset($slug) && $slug == 'profile'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'profile'  ? 'active indigo darken-4' : '' ?>" href="profile"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Modern">Staff Profile</span></a></li>
              <li class="<?= isset($slug) && $slug == 'eduroam'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'eduroam'  ? 'active indigo darken-4' : '' ?>" href="eduroam"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Modern">eduRoam info</span></a></li>
              <li class="<?= isset($slug) && $slug == 'notification'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'notification'  ? 'active indigo darken-4' : '' ?>" href="notification"><i class="material-icons">radio_button_unchecked</i><span data-i18n="eCommerce">Notification</span></a>
              </li>
            </ul>
          </div>
        </li>-->
        <li class="navigation-header"><a class="navigation-header-text light-blue-text text-darken-3">DHR STAFF SERVICES
            </a><i class="navigation-header-icon material-icons">more_horiz</i></li>
        <!--<li class="bold <?= isset($slug) && ($slug == 'docs') ? 'active open' : '' ?>"><a class="<?= isset($slug) && $slug == 'docs'  ? 'active indigo darken-4' : 'waves-effect waves-cyan' ?>" href="docs"><i class="material-icons">info</i><span class="menu-title" data-i18n="User Profile">CIRCULAR</span></a></li>-->

        <li class="<?= isset($slug) && $slug == 'circular'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'circular'  ? 'active indigo darken-4' : '' ?>" href="circular"><i class="material-icons">receipt</i><span data-i18n="Modern">CIRCULAR</span></a></li>

        <?php
        if (!empty($_SESSION['advisers'])) : ?>
            <li class="bold <?= isset($slug) && ($slug == 'stud_list') ? 'active open' : '' ?>"><a class="<?= isset($slug) && $slug == 'stud_list'  ? 'active indigo darken-4' : 'waves-effect waves-cyan' ?>" href="stud_list"><i class="material-icons">business_center</i><span class="menu-title" data-i18n="User Profile">ADVISER <small><span class="badge badge pill orange float-right mr-10 animated zoomIn infinite"><?= (!empty($_SESSION['stud_aca']) ? count($_SESSION['stud_aca']) : '0'); ?></span></small></span></a>
            </li>
        <?php endif; ?>

        <?php if ($_SESSION['user']['staff_group'] != 'SM' || ($_SESSION['user']['staff_type'] == 'NON-ACADEMIC' && $_SESSION['user']['staff_group'] == 'SM')) { ?>
            <li class="bold <?= isset($slug) && ($slug == 'leavereq' || $slug == 'leavestat') ? 'active open' : '' ?>">
                <a class="collapsible-header waves-effect waves-cyan menu-toggle" href="JavaScript:void(0)"><i class="material-icons">receipt</i><span class="menu-title" data-i18n="Invoice">LEAVE</span></a>
                <div class="collapsible-body">
                    <ul class="collapsible collapsible-sub" data-collapsible="accordion">
                        <li class="<?= isset($slug) && $slug == 'leavereq'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'leavereq'  ? 'active indigo darken-4' : '' ?>" href="leavereq"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice List">Leave Requests</span></a>
                        </li>
                        <li class="<?= isset($slug) && $slug == 'leavestat'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'leavestat'  ? 'active indigo darken-4' : '' ?>" href="leavestat"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice View">Leave Statistics</span></a>
                        </li>
                    </ul>
                </div>
            </li>
        <?php } ?>

        <li class="bold <?= isset($slug) && ($slug == 'promo_apply' || $slug == 'promo_list_new' || $slug == 'con_renewal' || $slug == 'promo_apply_sm') ? 'active open' : '' ?>">
            <a class="collapsible-header waves-effect waves-cyan menu-toggle" href="JavaScript:void(0)">
                <i class="material-icons">receipt</i><span class="menu-title" data-i18n="Invoice">PROMOTION</span></a>
            <div class="collapsible-body">
                <ul class="collapsible collapsible-sub" data-collapsible="accordion">
                    <!--<li class="<?= isset($slug) && $slug == 'promoreq'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'promoreq'  ? 'active indigo darken-4' : '' ?>" href="promoreq"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice List">Promotion Requests</span></a>
              </li>-->
                    <?php if ($_SESSION['user']['staff_group'] == 'SM') : ?>
                        <!-- <li class="<?= isset($slug) && $slug == 'promo_apply'  ? 'active' : '' ?>">
                            <a class="<?= isset($slug) && $slug == 'promo_apply'  ? 'active indigo darken-4' : '' ?>" href="promo_apply">
                                <i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice List">Apply For
                                    Promotion </span></a>
                        </li> -->
                        <li class="<?= isset($slug) && $slug == 'promo_apply_sm'  ? 'active' : '' ?>">
                            <a class="<?= isset($slug) && $slug == 'promo_apply_sm'  ? 'active indigo darken-4' : '' ?>" href="promo_apply_sm">
                                <i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice List">Apply For
                                    Promotion(SM) </span></a>
                        </li>
                        <!-- <li class="<?= isset($slug) && $slug == 'promo_list'  ? 'active' : '' ?>">
                            <a class="<?= isset($slug) && $slug == 'promo_list'  ? 'active indigo darken-4' : '' ?>" href="promo_list"><i class="material-icons">radio_button_unchecked</i>
                                <span data-i18n="Invoice List">View Promotion List
                                    <?php //echo $_SESSION['user']['roles']
                                    ?></span></a>
                        </li> -->
                        <li class="<?= isset($slug) && $slug == 'promo_list_new'  ? 'active' : '' ?>">
                            <a class="<?= isset($slug) && $slug == 'promo_list_new'  ? 'active indigo darken-4' : '' ?>" href="promo_list_new"><i class="material-icons">radio_button_unchecked</i>
                                <span data-i18n="Invoice List">View Promotion List
                                    <?php //echo $_SESSION['user']['roles']
                                    ?></span></a>
                        </li>
                    <?php endif; ?>

                    <li class="<?= isset($slug) && $slug == 'con_renewal'  ? 'active' : '' ?>">
                        <a class="<?= isset($slug) && $slug == 'con_renewal'  ? 'active indigo darken-4' : '' ?>" href="con_renewal"><i class="material-icons">radio_button_unchecked</i>
                            <span data-i18n="Invoice List">Contract/Confirmation</span></a>
                    </li>
                    <li class="<?= isset($slug) && $slug == 'contract_list'  ? 'active' : '' ?>">
                        <a class="<?= isset($slug) && $slug == 'contract_list'  ? 'active indigo darken-4' : '' ?>" href="contract_list"><i class="material-icons">radio_button_unchecked</i>
                            <span data-i18n="Invoice List">Contract/Con. List</span></a>
                    </li>
                    <!--<li class="<?= isset($slug) && $slug == 'promostat'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'promostat'  ? 'active indigo darken-4' : '' ?>" href="promostat"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice View">Promotion Statistics</span></a>
              </li>-->
                </ul>
            </div>
        </li>
        <li class="bold <?= isset($slug) && ($slug == 'appraisal_a' || $slug == 'appraisal_b') ? 'active open' : '' ?>">
            <a class="collapsible-header waves-effect waves-cyan menu-toggle" href="JavaScript:void(0)">
                <i class="material-icons">receipt</i><span class="menu-title" data-i18n="Invoice">APPRAISAL</span></a>
            <div class="collapsible-body">
                <ul class="collapsible collapsible-sub" data-collapsible="accordion">
                    <li class="<?= isset($slug) && $slug == 'appraisal_a'  ? 'active' : '' ?>">
                        <a class="<?= isset($slug) && $slug == 'appraisal_a'  ? 'active indigo darken-4' : '' ?>" href="appraisal_a"><i class="material-icons">radio_button_unchecked</i>
                            <span data-i18n="Invoice List">Appraisal Form A</span></a>
                    </li>
                    <li class="<?= isset($slug) && $slug == 'appraisal_b'  ? 'active' : '' ?>">
                        <a class="<?= isset($slug) && $slug == 'appraisal_b'  ? 'active indigo darken-4' : '' ?>" href="appraisal_b"><i class="material-icons">radio_button_unchecked</i>
                            <span data-i18n="Invoice List">Appraisal Form B</span></a>
                    </li>
                </ul>
            </div>
        </li>
        <li class="navigation-header"><a class="navigation-header-text light-blue-text text-darken-3">Training and
                development</a><i class="navigation-header-icon material-icons">more_horiz</i></li>
        <li class="bold <?= isset($slug) && ($slug == 'tnd_apply' || $slug == 'tnd_list') ? 'active open' : '' ?>"><a class="collapsible-header waves-effect waves-cyan menu-toggle" href="JavaScript:void(0)"><i class="material-icons">edit</i><span class="menu-title" data-i18n="Invoice">T&D Section</span></a>
            <div class="collapsible-body">
                <ul class="collapsible collapsible-sub" data-collapsible="accordion">
                    <li class="<?= isset($slug) && $slug == 'tnd_apply'  ? 'active' : '' ?>">
                        <a class="<?= isset($slug) && $slug == 'tnd_apply'  ? 'active indigo darken-4' : '' ?>" href="tnd_apply">
                            <i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice List">T&D Form
                            </span></a>
                    </li>
                    <li class="<?= isset($slug) && $slug == 'tnd_list'  ? 'active' : '' ?>">
                        <a class="<?= isset($slug) && $slug == 'tnd_list'  ? 'active indigo darken-4' : '' ?>" href="tnd_list">
                            <i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice List">T&D list
                            </span></a>
                    </li>
                </ul>
            </div>
        </li>

        <?php if ($_SESSION['user']['staff_no'] == '15876') : ?>

            <li class="navigation-header"><a class="navigation-header-text light-blue-text text-darken-3">VC's Office</a><i class="navigation-header-icon material-icons">more_horiz</i></li>
            <li class="bold <?= isset($slug) && ($slug == 'add_advisers' || $slug == 'add_advisers_stats') ? 'active open' : '' ?>"><a class="collapsible-header waves-effect waves-cyan menu-toggle" href="JavaScript:void(0)"><i class="material-icons">edit</i><span class="menu-title" data-i18n="Invoice">VC's Office</span></a>
                <div class="collapsible-body">
                    <ul class="collapsible collapsible-sub" data-collapsible="accordion">
                        <li class="<?= isset($slug) && $slug == 'add_advisers'  ? 'active' : '' ?>">
                            <a class="<?= isset($slug) && $slug == 'add_advisers'  ? 'active indigo darken-4' : '' ?>" href="add_advisers">
                                <i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice List">Add Advisers</span></a>
                        </li>
                        <li class="<?= isset($slug) && $slug == 'add_advisers_stats'  ? 'active' : '' ?>">
                            <a class="<?= isset($slug) && $slug == 'add_advisers_stats'  ? 'active indigo darken-4' : '' ?>" href="add_advisers_stats">
                                <i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice List">Generate report</span></a>
                        </li>
                    </ul>
                </div>
            </li>
        <?php endif; ?>

        <!--
        <li class="bold <?= isset($slug) && ($slug == 'transreq' || $slug == 'transtat') ? 'active open' : '' ?>"><a class="collapsible-header waves-effect waves-cyan " href="JavaScript:void(0)"><i class="material-icons">receipt</i><span class="menu-title" data-i18n="Invoice">TRANSFER</span></a>
          <div class="collapsible-body">
            <ul class="collapsible collapsible-sub" data-collapsible="accordion">
              <li class="<?= isset($slug) && $slug == 'transreq'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'transreq'  ? 'active indigo darken-4' : '' ?>" href="transreq"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice List">Transfer Requests</span></a>
              </li>
              <li class="<?= isset($slug) && $slug == 'transtat'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'transtat'  ? 'active indigo darken-4' : '' ?>" href="transtat"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice View">Transfer Statistics</span></a>
              </li>
            </ul>
          </div>
        </li>
        
        <li class="bold <?= isset($slug) && ($slug == 'transreq' || $slug == 'transtat') ? 'active open' : '' ?>"><a class="collapsible-header waves-effect waves-cyan " href="JavaScript:void(0)"><i class="material-icons">receipt</i><span class="menu-title" data-i18n="Invoice">APPRAISAL</span></a>
          <div class="collapsible-body">
            <ul class="collapsible collapsible-sub" data-collapsible="accordion">
              <li class="<?= isset($slug) && $slug == 'transreq'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'transreq'  ? 'active indigo darken-4' : '' ?>" href="transreq"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice List">Staff Appraisal Entries</span></a>
              </li>
            </ul>
          </div>
        </li>
       
        <li class="bold <?= isset($slug) && ($slug == 'transreq' || $slug == 'transtat') ? 'active open' : '' ?>"><a class="collapsible-header waves-effect waves-cyan " href="JavaScript:void(0)"><i class="material-icons">receipt</i><span class="menu-title" data-i18n="Invoice">CONTRACTS</span></a>
          <div class="collapsible-body">
            <ul class="collapsible collapsible-sub" data-collapsible="accordion">
              <li class="<?= isset($slug) && $slug == 'transreq'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'transreq'  ? 'active indigo darken-4' : '' ?>" href="transreq"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice List">Contract Appointments</span></a></li>
              <li class="<?= isset($slug) && $slug == 'transreq'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'transreq'  ? 'active indigo darken-4' : '' ?>" href="transreq"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice List">Contract Duty Claims</span></a></li>
            </ul>
          </div>
        </li>

        <li class="bold <?= isset($slug) && ($slug == 'transreq' || $slug == 'transtat') ? 'active open' : '' ?>"><a class="collapsible-header waves-effect waves-cyan " href="JavaScript:void(0)"><i class="material-icons">receipt</i><span class="menu-title" data-i18n="Invoice">PAPERS</span></a>
          <div class="collapsible-body">
            <ul class="collapsible collapsible-sub" data-collapsible="accordion">
              <li class="<?= isset($slug) && $slug == 'transreq'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'transreq'  ? 'active indigo darken-4' : '' ?>" href="transreq"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice List">My Journals & Memos</span></a>
              </li>
            </ul>
          </div>
        </li>
       -->
        <?php
        // var_dump($_SESSION['apply_procure'][0]['apply_procure']);
        if (isset($_SESSION['apply_procure'][0]) && $_SESSION['apply_procure'][0]['apply_procure'] == $_SESSION['user']['staff_no']) : ?>
            <li class="<?= isset($slug) && $slug == 'procure_itemhod'  ? 'active' : '' ?>">
                <a class="<?= isset($slug) && $slug == 'procure_itemhod'  ? 'active indigo darken-4' : '' ?>" href="procure_itemhod"><i class="material-icons">radio_button_unchecked</i>
                    <span data-i18n="Invoice List">Procure item(s)</span></a>
            </li>
            <!-- <li class="<?= isset($slug) && $slug == 'procurement_listhod'  ? 'active' : '' ?>">
                            <a class="<?= isset($slug) && $slug == 'procurement_listhod'  ? 'active indigo darken-4' : '' ?>" href="procurement_listhod"><i class="material-icons">radio_button_unchecked</i>
                                <span data-i18n="Invoice List">Procurement List</span></a>
                        </li> -->
            <li class="<?= isset($slug) && $slug == 'procurementlisthod'  ? 'active' : '' ?>">
                <a class="<?= isset($slug) && $slug == 'procurementlisthod'  ? 'active indigo darken-4' : '' ?>" href="procurementlisthod"><i class="material-icons">radio_button_unchecked</i>
                    <span data-i18n="Invoice List">Procurement List</span></a>
            </li>
        <?php endif; ?>
        <?php if ($_SESSION['user']['role'] == '04' || $_SESSION['user']['hasAsset']) { ?>
            <li class="navigation-header"><a class="navigation-header-text light-blue-text text-darken-3">ESTATE SECTION
                    SERVICES </a><i class="navigation-header-icon material-icons">more_horiz</i></li>
            <li class="bold <?= isset($slug) && ($slug == 'indivreq' || $slug == 'deptreq') ? 'active open' : '' ?>"><a class="collapsible-header waves-effect waves-cyan menu-toggle" href="JavaScript:void(0)"><i class="material-icons">repeat</i><span class="menu-title" data-i18n="Invoice">REQUEST
                        SERVICES</span></a>
                <div class="collapsible-body">
                    <ul class="collapsible collapsible-sub" data-collapsible="accordion">
                        <?php if ($_SESSION['user']['hasAsset']) { ?>
                            <li class="<?= isset($slug) && $slug == 'indivreq'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'indivreq'  ? 'active indigo darken-4' : '' ?>" href="indivreq"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice List">Individual Requests</span></a>
                            </li>
                        <?php } ?>
                        <?php if ($_SESSION['user']['role'] == '04') { ?>
                            <li class="<?= isset($slug) && $slug == 'deptreq'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'deptreq'  ? 'active indigo darken-4' : '' ?>" href="deptreq"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice View">Department Requests</span></a>
                            </li>
                        <?php } ?>
                    </ul>
                </div>
            </li>
        <?php } ?>

        <?php if ($_SESSION['user']['role'] == '04') { ?>
            <li class="navigation-header"><a class="navigation-header-text light-blue-text text-darken-3">OFFICIAL DOCUMENTS
                    CABINET </a><i class="navigation-header-icon material-icons">more_horiz</i></li>
            <li class="bold <?= isset($slug) && ($slug == 'docs') ? 'active open' : '' ?>"><a class="<?= isset($slug) && $slug == 'docs'  ? 'active indigo darken-4' : 'waves-effect waves-cyan' ?>" href="docs"><i class="material-icons">business_center</i><span class="menu-title" data-i18n="User Profile">STORE & SHARE DOCS</span></a></li>
        <?php } ?>
        <?php if (!empty($_SESSION['procureset'])) : ?>
            <li class="bold <?= isset($slug) && ($slug == 'procurement_comments') ? 'active open' : '' ?>"><a class="<?= isset($slug) && $slug == 'procurement_comments'  ? 'active indigo darken-4' : 'waves-effect waves-cyan' ?>" href="procurement_comments"><i class="material-icons">business_center</i><span class="menu-title" data-i18n="User Profile">PROCUREMENT <small><span class="badge badge pill orange float-right mr-10 animated zoomIn infinite"><?= count($_SESSION['procureset']); ?></span></small></span></a>
            </li>
        <?php endif; ?>

        <?php if ($_SESSION['user']['role'] == '04' || (isset($_SESSION['uheadsub_id']) && $_SESSION['uheadsub_id'] == $_SESSION['user']['staff_no'])) { ?>
            <li class="navigation-header"><a class="navigation-header-text light-blue-text text-darken-3">
                    <?php if (isset($_SESSION['uhead']) && $_SESSION['uhead'] == '01') {
                        if (isset($_SESSION['uheadsub_id']) && $_SESSION['uheadsub_id'] == $_SESSION['user']['staff_no']) {
                            echo ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'COLLEGE' : 'REGISTRAR');
                        } else {
                            echo ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'PROVOST' : 'REGISTRAR');
                        }
                    } elseif (isset($_SESSION['uhead']) && $_SESSION['uhead'] == '02') {
                        if (isset($_SESSION['uheadsub_id']) && $_SESSION['uheadsub_id'] == $_SESSION['user']['staff_no']) {
                            echo ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'FACULTY' : 'REGISTRAR');
                        } else {
                            echo ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'DEAN' : 'DIRECTOR');
                        }
                    } else {
                        echo 'HOD';
                    } ?>'S MODULE


                </a><i class="navigation-header-icon material-icons">more_horiz</i></li>
            <li class="bold <?= isset($slug) && ($slug == 'members' || $slug == 'unitleave' || $slug == 'aca_ad_approve' || $slug == 'procure_itemhod' || $slug == 'procurementlisthod' || $slug == 'promo_listhod_new'
                                || $slug == 'procure_itemhod' || $slug == 'procurementlistdd' || $slug == 'promo_listdd' || $slug == 'promo_listdd_new' || $slug == 'procurementlistpr' || $slug == 'promo_listpr' || $slug == 'promo_listpr_new' || $slug == 'add_advisers'
                                || $slug == 'appraisal_hod') ? 'active open' : '' ?>"><a class="collapsible-header waves-effect waves-cyan menu-toggle" href="JavaScript:void(0)"><i class="material-icons">style</i><span class="menu-title" data-i18n="Invoice">

                        <?php if (isset($_SESSION['uhead']) && $_SESSION['uhead'] == '01') {
                            if (isset($_SESSION['uheadsub_id']) && $_SESSION['uheadsub_id'] == $_SESSION['user']['staff_no']) {
                                echo ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'COLLEGE' : 'REGISTRAR');
                            } else {
                                echo ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'PROVOST' : 'REGISTRAR');
                            }
                        } elseif (isset($_SESSION['uhead']) && $_SESSION['uhead'] == '02') {
                            if (isset($_SESSION['uheadsub_id']) && $_SESSION['uheadsub_id'] == $_SESSION['user']['staff_no']) {
                                echo ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'FACULTY' : 'REGISTRAR');
                            } else {
                                echo ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'DEAN' : 'DIRECTOR');
                            }
                        } else {
                            echo 'HOD';
                        } ?>'S MODULE </span></a>
                <div class="collapsible-body">
                    <ul class="collapsible collapsible-sub" data-collapsible="accordion">
                        <li class="<?= isset($slug) && $slug == 'members'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'members'  ? 'active indigo darken-4' : '' ?>" href="members"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice List">Unit Members</span></a></li>
                        <li class="<?= isset($slug) && $slug == 'unitleave'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'unitleave'  ? 'active indigo darken-4' : '' ?>" href="unitleave"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice View">Staff Leave</span></a></li>
                        <!--<li class="<?= isset($slug) && $slug == 'unitpromo'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'unitpromo'  ? 'active indigo darken-4' : '' ?>" href="unitpromo"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice View">Staff Promotions</span></a></li>-->
                        <!-- <li class="<?= isset($slug) && $slug == 'unitrenew'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'unitrenew'  ? 'active indigo darken-4' : '' ?>" href="unitrenew"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice View">Staff (SM) Renewals</span></a></li>
              <li class="<?= isset($slug) && $slug == 'unitappraise'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'unitappraise'  ? 'active indigo darken-4' : '' ?>" href="unitpromo"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice View">Staff Appraisals</span></a></li>
             -->
                        <!-- <li class="<?= isset($slug) && $slug == 'add_advisers'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'add_advisers'  ? 'active indigo darken-4' : '' ?>" href="add_advisers"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice List">Add Advisers</span></a></li> -->


                        <!-- <li class="<?= isset($slug) && $slug == 'aca_ad_approve'  ? 'active' : '' ?>"><a class="<?= isset($slug) && $slug == 'aca_ad_approve'  ? 'active indigo darken-4' : '' ?>" href="aca_ad_approve"><i class="material-icons">radio_button_unchecked</i><span data-i18n="Invoice List">Academic Advisers</span></a></li> -->

                        <?php if (isset($_SESSION['uhead']) && $_SESSION['uhead'] == '04') { ?>
                            <li class="<?= isset($slug) && $slug == 'procure_itemhod'  ? 'active' : '' ?>">
                                <a class="<?= isset($slug) && $slug == 'procure_itemhod'  ? 'active indigo darken-4' : '' ?>" href="procure_itemhod"><i class="material-icons">radio_button_unchecked</i>
                                    <span data-i18n="Invoice List">Procure item(s)</span></a>
                            </li>
                            <!-- <li class="<?= isset($slug) && $slug == 'procurement_listhod'  ? 'active' : '' ?>">
                            <a class="<?= isset($slug) && $slug == 'procurement_listhod'  ? 'active indigo darken-4' : '' ?>" href="procurement_listhod"><i class="material-icons">radio_button_unchecked</i>
                                <span data-i18n="Invoice List">Procurement List</span></a>
                        </li> -->
                            <li class="<?= isset($slug) && $slug == 'procurementlisthod'  ? 'active' : '' ?>">
                                <a class="<?= isset($slug) && $slug == 'procurementlisthod'  ? 'active indigo darken-4' : '' ?>" href="procurementlisthod"><i class="material-icons">radio_button_unchecked</i>
                                    <span data-i18n="Invoice List">Procurement List</span></a>
                            </li>
                            <li class="<?= isset($slug) && $slug == 'promo_listhod_new'  ? 'active' : '' ?>">
                                <a class="<?= isset($slug) && $slug == 'promo_listhod_new'  ? 'active indigo darken-4' : '' ?>" href="promo_listhod_new"><i class="material-icons">radio_button_unchecked</i>
                                    <span data-i18n="Invoice List">Promotion List</span></a>
                            </li>
                            <!-- <li class="<?= isset($slug) && $slug == 'promo_listhod'  ? 'active' : '' ?>">
                                <a class="<?= isset($slug) && $slug == 'promo_listhod'  ? 'active indigo darken-4' : '' ?>" href="promo_listhod"><i class="material-icons">radio_button_unchecked</i>
                                    <span data-i18n="Invoice List">Promotion List (HOD)</span></a>
                            </li> -->
                            <?php //if ($_SESSION['user']['staff_no'] == '11219') : 
                            ?>
                            <!-- <li class="<?= isset($slug) && $slug == 'promo_listpr'  ? 'active' : '' ?>">
                                    <a class="<?= isset($slug) && $slug == 'promo_listpr'  ? 'active indigo darken-4' : '' ?>" href="promo_listpr"><i class="material-icons">radio_button_unchecked</i>
                                        <span data-i18n="Invoice List"><?= ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'Promotion List (Provost)' : 'Promotion List (Registrar)') ?></span></a>
                                </li> -->
                            <?php //endif; 
                            ?>
                            <!-- <li class="<?= isset($slug) && $slug == 'declaration_formhod'  ? 'active' : '' ?>">
                            <a class="<?= isset($slug) && $slug == 'declaration_formhod'  ? 'active indigo darken-4' : '' ?>" href="declaration_formhod"><i class="material-icons">radio_button_unchecked</i>
                                <span data-i18n="Invoice List">Declaration List (HOD)</span></a>
                        </li> -->
                            <!-- <li class="<?= isset($slug) && $slug == 'contract_listhod'  ? 'active' : '' ?>">
                            <a class="<?= isset($slug) && $slug == 'contract_listhod'  ? 'active indigo darken-4' : '' ?>" href="contract_listhod"><i class="material-icons">radio_button_unchecked</i>
                                <span data-i18n="Invoice List">Contract Renewal List</span></a>
                        </li> -->
                        <?php } ?>
                        <?php if (isset($_SESSION['uhead']) && $_SESSION['uhead'] == '03') { ?>
                            <li class="<?= isset($slug) && $slug == 'procure_itemhod'  ? 'active' : '' ?>">
                                <a class="<?= isset($slug) && $slug == 'procure_itemhod'  ? 'active indigo darken-4' : '' ?>" href="procure_itemhod"><i class="material-icons">radio_button_unchecked</i>
                                    <span data-i18n="Invoice List">Procure item(s)</span></a>
                            </li>
                            <!-- <li class="<?= isset($slug) && $slug == 'procurement_listhod'  ? 'active' : '' ?>">
                            <a class="<?= isset($slug) && $slug == 'procurement_listhod'  ? 'active indigo darken-4' : '' ?>" href="procurement_listhod"><i class="material-icons">radio_button_unchecked</i>
                                <span data-i18n="Invoice List">Procurement List</span></a>
                        </li> -->
                            <li class="<?= isset($slug) && $slug == 'procurementlisthod'  ? 'active' : '' ?>">
                                <a class="<?= isset($slug) && $slug == 'procurementlisthod'  ? 'active indigo darken-4' : '' ?>" href="procurementlisthod"><i class="material-icons">radio_button_unchecked</i>
                                    <span data-i18n="Invoice List">Procurement List</span></a>
                            </li>
                            <li class="<?= isset($slug) && $slug == 'promo_listhod_new'  ? 'active' : '' ?>">
                                <a class="<?= isset($slug) && $slug == 'promo_listhod_new'  ? 'active indigo darken-4' : '' ?>" href="promo_listhod_new"><i class="material-icons">radio_button_unchecked</i>
                                    <span data-i18n="Invoice List">Promotion List</span></a>
                            </li>
                            <!-- <li class="<?= isset($slug) && $slug == 'promo_listhod'  ? 'active' : '' ?>">
                                <a class="<?= isset($slug) && $slug == 'promo_listhod'  ? 'active indigo darken-4' : '' ?>" href="promo_listhod"><i class="material-icons">radio_button_unchecked</i>
                                    <span data-i18n="Invoice List">Promotion List (HOD)</span></a>
                            </li> -->
                            <!-- <li class="<?= isset($slug) && $slug == 'declaration_formhod'  ? 'active' : '' ?>">
                            <a class="<?= isset($slug) && $slug == 'declaration_formhod'  ? 'active indigo darken-4' : '' ?>" href="declaration_formhod"><i class="material-icons">radio_button_unchecked</i>
                                <span data-i18n="Invoice List">Declaration List (HOD)</span></a>
                        </li>
                        <li class="<?= isset($slug) && $slug == 'contract_listhod'  ? 'active' : '' ?>">
                            <a class="<?= isset($slug) && $slug == 'contract_listhod'  ? 'active indigo darken-4' : '' ?>" href="contract_listhod"><i class="material-icons">radio_button_unchecked</i>
                                <span data-i18n="Invoice List">Contract Renewal List</span></a>
                        </li> -->
                        <?php } ?>
                        <?php if (isset($_SESSION['uhead']) && $_SESSION['uhead'] == '02') { ?>
                            <li class="<?= isset($slug) && $slug == 'procure_itemhod'  ? 'active' : '' ?>">
                                <a class="<?= isset($slug) && $slug == 'procure_itemhod'  ? 'active indigo darken-4' : '' ?>" href="procure_itemhod"><i class="material-icons">radio_button_unchecked</i>
                                    <span data-i18n="Invoice List">Procure item(s)</span></a>
                            </li>

                            <!-- <li class="<?= isset($slug) && $slug == 'procurement_listdd'  ? 'active' : '' ?>">
                            <a class="<?= isset($slug) && $slug == 'procurement_listdd'  ? 'active indigo darken-4' : '' ?>" href="procurement_listdd"><i class="material-icons">radio_button_unchecked</i>
                                <span data-i18n="Invoice List"><?= ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'Procurement List (Dean)' : 'Procurement List (Dir)') ?></span></a>
                        </li> -->

                            <li class="<?= isset($slug) && $slug == 'procurementlistdd'  ? 'active' : '' ?>">
                                <a class="<?= isset($slug) && $slug == 'procurementlistdd'  ? 'active indigo darken-4' : '' ?>" href="procurementlistdd"><i class="material-icons">radio_button_unchecked</i>
                                    <span data-i18n="Invoice List"><?= ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'Procurement List (Dean)' : 'Procurement List (Dir)') ?></span></a>
                            </li>

                            <li class="<?= isset($slug) && $slug == 'promo_listdd_new'  ? 'active' : '' ?>">
                                <a class="<?= isset($slug) && $slug == 'promo_listdd_new'  ? 'active indigo darken-4' : '' ?>" href="promo_listdd_new"><i class="material-icons">radio_button_unchecked</i>
                                    <span data-i18n="Invoice List"><?= ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'Promotion List (Dean)' : 'Promotion List (Director)') ?></span></a>
                            </li>
                            <!-- <li class="<?= isset($slug) && $slug == 'promo_listdd'  ? 'active' : '' ?>">
                                <a class="<?= isset($slug) && $slug == 'promo_listdd'  ? 'active indigo darken-4' : '' ?>" href="promo_listdd"><i class="material-icons">radio_button_unchecked</i>
                                    <span data-i18n="Invoice List"><?= ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'Promotion List (Dean)' : 'Promotion List (Director)') ?></span></a>
                            </li> -->
                            <!-- <li class="<?= isset($slug) && $slug == 'declaration_formdd'  ? 'active' : '' ?>">
                                <a class="<?= isset($slug) && $slug == 'declaration_formdd'  ? 'active indigo darken-4' : '' ?>" href="declaration_formdd"><i class="material-icons">radio_button_unchecked</i>
                                    <span data-i18n="Invoice List"><?= ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'Declaration List (Dean)' : 'Declaration List (Director)') ?></span></a>
                            </li>
                            <li class="<?= isset($slug) && $slug == 'contract_listdd'  ? 'active' : '' ?>">
                                <a class="<?= isset($slug) && $slug == 'contract_listdd'  ? 'active indigo darken-4' : '' ?>" href="contract_listdd"><i class="material-icons">radio_button_unchecked</i>
                                    <span data-i18n="Invoice List">Contract Renewal List</span></a>
                            </li> -->
                        <?php } ?>
                        <?php if (isset($_SESSION['uhead']) && $_SESSION['uhead'] == '01') { ?>
                            <li class="<?= isset($slug) && $slug == 'procure_itemhod'  ? 'active' : '' ?>">
                                <a class="<?= isset($slug) && $slug == 'procure_itemhod'  ? 'active indigo darken-4' : '' ?>" href="procure_itemhod"><i class="material-icons">radio_button_unchecked</i>
                                    <span data-i18n="Invoice List">Procure item(s)</span></a>
                            </li>

                            <!-- <li class="<?= isset($slug) && $slug == 'procurement_listpr'  ? 'active' : '' ?>">
                            <a class="<?= isset($slug) && $slug == 'procurement_listpr'  ? 'active indigo darken-4' : '' ?>" href="procurement_listpr"><i class="material-icons">radio_button_unchecked</i>
                                <span data-i18n="Invoice List"><?= ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'Procurement List (PV)' : 'Procurement List (Reg)') ?></span></a>
                        </li> -->
                            <li class="<?= isset($slug) && $slug == 'procurementlistpr'  ? 'active' : '' ?>">
                                <a class="<?= isset($slug) && $slug == 'procurementlistpr'  ? 'active indigo darken-4' : '' ?>" href="procurementlistpr"><i class="material-icons">radio_button_unchecked</i>
                                    <span data-i18n="Invoice List"><?= ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'Procurement List (PV)' : 'Procurement List (Reg)') ?></span></a>
                            </li>
                            <!-- <?php if ($_SESSION['headtype'] == 'ACADEMIC') : ?>
                                <li class="<?= isset($slug) && $slug == 'promo_listpr'  ? 'active' : '' ?>">
                                    <a class="<?= isset($slug) && $slug == 'promo_listpr'  ? 'active indigo darken-4' : '' ?>" href="promo_listpr"><i class="material-icons">radio_button_unchecked</i>
                                        <span data-i18n="Invoice List"><?= ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'Promotion List (Provost)' : 'Promotion List (Registrar)') ?></span></a>
                                </li>
                            <?php elseif ($_SESSION['user']['staff_no'] == '11219') : ?>
                                <li class="<?= isset($slug) && $slug == 'promo_listpr'  ? 'active' : '' ?>">
                                    <a class="<?= isset($slug) && $slug == 'promo_listpr'  ? 'active indigo darken-4' : '' ?>" href="promo_listpr"><i class="material-icons">radio_button_unchecked</i>
                                        <span data-i18n="Invoice List"><?= ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'Promotion List (Provost)' : 'Promotion List (Registrar)') ?></span></a>
                                </li>
                            <?php endif; ?> -->
                            <!-- <li class="<?= isset($slug) && $slug == 'promo_listpr'  ? 'active' : '' ?>">
                                <a class="<?= isset($slug) && $slug == 'promo_listpr'  ? 'active indigo darken-4' : '' ?>" href="promo_listpr"><i class="material-icons">radio_button_unchecked</i>
                                    <span data-i18n="Invoice List"><?= ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'Promotion List (Provost)' : 'Promotion List (Registrar)') ?></span></a>
                            </li> -->
                            <li class="<?= isset($slug) && $slug == 'promo_listpr_new'  ? 'active' : '' ?>">
                                <a class="<?= isset($slug) && $slug == 'promo_listpr_new'  ? 'active indigo darken-4' : '' ?>" href="promo_listpr_new"><i class="material-icons">radio_button_unchecked</i>
                                    <span data-i18n="Invoice List"><?= ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'Promotion List (Provost)' : 'Promotion List (Registrar)') ?></span></a>
                            </li>
                            <?php if (isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') : ?>
                                <!-- <li class="<?= isset($slug) && $slug == 'declaration_formpr'  ? 'active' : '' ?>">
                                <a class="<?= isset($slug) && $slug == 'declaration_formpr'  ? 'active indigo darken-4' : '' ?>" href="declaration_formpr"><i class="material-icons">radio_button_unchecked</i>
                                    <span data-i18n="Invoice List"><?= ((isset($_SESSION['headtype']) && $_SESSION['headtype'] == 'ACADEMIC') ? 'Declaration List (Provost)' : 'Declaration List (Registrar)') ?></span></a>
                            </li> -->
                            <?php endif; ?>
                            <!-- <li class="<?= isset($slug) && $slug == 'contract_listpr'  ? 'active' : '' ?>">
                            <a class="<?= isset($slug) && $slug == 'contract_listpr'  ? 'active indigo darken-4' : '' ?>" href="contract_listpr"><i class="material-icons">radio_button_unchecked</i>
                                <span data-i18n="Invoice List">Contract Renewal List</span></a>
                        </li> -->
                        <?php } ?>
                        <!-- <li class="<?= isset($slug) && $slug == 'appraisal_hod'  ? 'active' : '' ?>">
                        <a class="<?= isset($slug) && $slug == 'appraisal_hod'  ? 'active indigo darken-4' : '' ?>" href="appraisal_hod"><i class="material-icons">radio_button_unchecked</i>
                            <span data-i18n="Invoice List">Appraisal HOD</span></a>
                    </li> -->
                    </ul>
                </div>
            </li>
        <?php } ?>

        <!--
        <?php if ($_SESSION['user']['role'] == '04') { ?>
        <li class="navigation-header"><a class="navigation-header-text light-blue-text text-darken-3">UCC RESOURCES & DOCS  </a><i class="navigation-header-icon material-icons">more_horiz</i></li>
        <li class="bold <?= isset($slug) && ($slug == 'docs') ? 'active open' : '' ?>"><a class="<?= isset($slug) && $slug == 'docs'  ? 'active indigo darken-4' : 'waves-effect waves-cyan' ?>" href="docs"><i class="material-icons">business_center</i><span class="menu-title" data-i18n="User Profile">STORE & SHARE DOCS</span></a></li>
        <?php } ?>
        -->

    </ul>
    <div class="navigation-background"></div><a class="sidenav-trigger btn-sidenav-toggle btn-floating btn-medium waves-effect waves-light hide-on-large-only" href="#" data-target="slide-out"><i class="material-icons">menu</i></a>
</aside>
<!-- END: SideNav-->