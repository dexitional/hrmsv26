<style>
    /* The actual timeline (the vertical ruler) */
    .main-timeline-5 {
        position: relative;
        max-width: 100%;
        margin: 0 auto;
    }

    /* The actual timeline (the vertical ruler) */
    .main-timeline-5::after {
        content: "";
        position: absolute;
        width: 3px;
        background-color: #263875;
        top: 0;
        bottom: 0;
        left: auto;
        margin-left: -3px;
    }

    /* Container around content */
    .timeline-5 {
        position: relative;
        background-color: inherit;
        width: 100%;
    }

    /* The circles on the timeline */
    .timeline-5::after {
        content: "";
        position: absolute;
        width: 17px;
        height: 17px;
        right: 1px;
        background-color: #263875;
        top: 18px;
        border-radius: 50%;
        z-index: 1;
    }

    /* Place the container to the right */
    .right-5 {
        padding: 0px 0px 20px 40px;
        left: auto;
    }

    /* Add arrows to the right container (pointing left) */
    .right-5::before {
        content: " ";
        position: absolute;
        top: 18px;
        z-index: 1;
        left: 30px;
        border: medium solid #263875;
        border-width: 10px 10px 10px 0;
        border-color: transparent #263875 transparent transparent;
    }

    /* Fix the circle for containers on the right side */
    .right-5::after {
        left: -10px;
    }

    @media (max-width: 991px) {
        .main-timeline-5 {
            max-width: 100%;
        }
    }
</style>
<h5 class="theme-cutomizer-title red lighten-4 pt-2 pr-2 pl-2 pb-3 mt-10 circle-rounded white-text light-blue darken-4 box-shadow-none border-round center">APPLICATION STAGES</h5>
<section class="gradient-custom-5">
    <div class="container py-5">
        <div class="main-timeline-5">
            <?php
            foreach ($ps1 as $s_data) {
            ?>
                <div class="timeline-5 right-5">
                    <div class="card">
                        <div class="card-body p-4" style="padding: 10px;">
                            <!-- <li style="border-style:dotted"> -->
                            <small>
                                <date class="cbp_tmtime"><?php echo $s_data['activity_date']; ?></date>
                            </small>
                            <!-- <div class="cbp_tmicon">
                    <i class="material-icons">thumb_up</i>
                </div> -->
                            <div class="cbp_tmlabel">
                                <h5>
                                    APPLICANT
                                </h5>
                                <p><?php echo $s_data['stage_activity']; ?>
                                    <?php echo $s_data['comments']; ?></p>
                                <p><?php echo $ps8[0]['promo_comments']; ?></p>
                                <p class="white-text light-blue darken-4">Documents</p>
                                <a href="downloadfile1/<?php echo $ps8[0]['promotion_id']; ?>" style="color:white" class="text-darken-4 blue-text  btn white" title="Download CV"><i class="fa fa-download fa-2x"></i></a>
                                <?php if (!empty($ps8[0]['apply_form'])) : ?>
                                    <a href="downloadfile/<?php echo $ps8[0]['promotion_id']; ?>" style="color:white" class="text-darken-4 blue-text  btn white" title="Download Papers"><i class="fa fa-download fa-2x"></i></a>
                                    <a href="downloadfile2/<?php echo $ps8[0]['promotion_id']; ?>" style="color:white" class="text-darken-4 blue-text  btn white" title="Download Form"><i class="fa fa-download fa-2x"></i></a>
                                <?php endif; ?>
                                <?php if (!empty($ps20[0]['app_letter'])) : ?>
                                    <a href="downloadfile_promos/<?php echo $ps20[0]['id']; ?>:app_letter" style="color:white" class="text-darken-4 blue-text  btn white" title="Download Letter"><i class="fa fa-download fa-2x"></i></a>
                                <?php endif; ?>
                                <?php foreach ($ps22 as $ps22[0]) { ?>
                                    <a href="downloadfile_promos_papers/<?php echo $ps22[0]['id']; ?>:file" style="color:white" class="text-darken-4 blue-text  btn white" title="Download Paper"><i class="fa fa-download fa-2x"></i>
                                        <!-- <i class="fa fa-download fa-2x"></i> <?php //echo $ps22[0]['title']
                                                                                    ?> --></a>
                                <?php } ?>
                            </div>
                            <!-- </li> -->
                        </div>
                    </div>
                </div>
            <?php } ?>
            <?php if (!empty($ps0)) {

                foreach ($ps0 as $r_data) {
            ?>
                    <div class="timeline-5 right-5">
                        <div class="card">
                            <div class="card-body p-4" style="padding: 10px;">
                                <!-- <li> -->
                                <time class="cbp_tmtime"><span class="hidden"><?php echo $r_data['act_activity_date']; ?></span></time>
                                <div class="cbp_tmlabel">
                                    <p class="text-uppercase"><b>
                                            <?php if ($r_data['act_returned'] == 1) { ?>
                                                <i class="fa fa-undo"></i>
                                            <?php } elseif ($r_data['activity'] == 1) { ?>
                                                <i class="fa fa-thumb-up"></i>
                                            <?php } elseif ($r_data['activity'] == 2) { ?>
                                                <i class="fa fa-thumb-down"></i>
                                            <?php } else { ?>
                                                <i class="fa fa-user"></i>
                                            <?php } ?>

                                            <a href="javascript:void(0);" class="text-darken-4 blue-text">
                                                <?php if ($r_data['act_promo_status'] == 1 && $r_data['act_returned'] == 1 && ($r_data['activity'] != 13 && $r_data['activity'] != 14)) {
                                                    echo 'HOD to APPLICANT';
                                                } elseif ($r_data['act_promo_status'] == 2 && $r_data['act_returned'] == 1 && ($r_data['activity'] != 13 && $r_data['activity'] != 14)) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'DIRECTOR to APPLICANT' : 'DEAN to APPLICANT';
                                                } elseif ($r_data['act_promo_status'] == 3 && $r_data['act_returned'] == 1 && ($r_data['activity'] != 13 && $r_data['activity'] != 14)) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'REGISTRAR to APPLICANT' : 'PROVOST to APPLICANT';
                                                } elseif ($r_data['act_promo_status'] == 4 && $r_data['act_returned'] == 1 && ($r_data['activity'] != 13 && $r_data['activity'] != 14)) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'HR to APPLICANT' : 'HR to APPLICANT';
                                                }elseif ($r_data['act_promo_status'] == 2 && $r_data['act_returned'] == 1 && $r_data['activity'] == 13) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'DIRECTOR to HOD and APPLICANT' : 'DEAN to HOD and APPLICANT';
                                                }elseif ($r_data['act_promo_status'] == 3 && $r_data['act_returned'] == 1 && $r_data['activity'] == 13) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'REGISTRAR to DIRECTOR and APPLICANT' : 'PROVOST to DEAN and APPLICANT';
                                                }elseif ($r_data['act_promo_status'] == 4 && $r_data['act_returned'] == 1 && $r_data['activity'] == 13) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'HR to REGISTRAR and APPLICANT' : 'HR to PROVOST and APPLICANT';
                                                }elseif ($r_data['act_promo_status'] == 2 && $r_data['act_returned'] == 1 && $r_data['activity'] == 14) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'DIRECTOR to HOD' : 'DEAN to HOD';
                                                }elseif ($r_data['act_promo_status'] == 3 && $r_data['act_returned'] == 1 && $r_data['activity'] == 14) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'REGISTRAR to DIRECTOR' : 'PROVOST to DEAN';
                                                }elseif ($r_data['act_promo_status'] == 4 && $r_data['act_returned'] == 1 && $r_data['activity'] == 14) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'HR to REGISTRAR' : 'HR to PROVOST';
                                                } elseif ($r_data['act_promo_status'] == 1 && $r_data['activity'] == 1 && $r_data['act_returned'] == 0) {
                                                    echo 'HOD to APPLICANT';
                                                } elseif ($r_data['act_promo_status'] == 2 && $r_data['activity'] == 1 && $r_data['act_returned'] == 0) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'HOD' : 'HOD';
                                                } elseif ($r_data['act_promo_status'] == 3 && $r_data['activity'] == 1 && $r_data['act_returned'] == 0) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'DIRECTOR' : 'DEAN';
                                                } elseif ($r_data['act_promo_status'] == 4 && $r_data['activity'] == 1 && $r_data['act_returned'] == 0) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'REGISTRAR' : 'PROVOST';
                                                } elseif ($r_data['act_promo_status'] == 1 && $r_data['activity'] < 7 && $r_data['act_returned'] == 0) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'HOD' : 'HOD';
                                                } elseif ($r_data['act_promo_status'] == 2 && $r_data['activity'] < 7 && $r_data['act_returned'] == 0) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'DIRECTOR to APPLICANT' : 'DEAN to APPLICANT';
                                                } elseif ($r_data['act_promo_status'] == 3 && $r_data['activity'] < 7 && $r_data['act_returned'] == 0) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'REGISTRAR to APPLICANT' : 'PROVOST to APPLICANT';
                                                } elseif ($r_data['act_promo_status'] == 4 && $r_data['activity'] < 7 && $r_data['act_returned'] == 0) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'HR' : 'HR';
                                                } elseif ($r_data['act_promo_status'] == 5 && $r_data['activity'] < 7 && $r_data['act_returned'] == 0) {
                                                    echo $r_data['stage_activity'];
                                                } elseif ($r_data['act_promo_status'] == 6 && $r_data['activity'] < 7 && $r_data['act_returned'] == 0) {
                                                    echo $r_data['stage_activity'];
                                                } elseif ($r_data['act_promo_status'] == 7 && $r_data['activity'] < 7 && $r_data['act_returned'] == 0) {
                                                    echo $r_data['stage_activity'] . ($r_data['stage_activity'] == 'Approved') ? '-PROMOTED' : '';
                                                } elseif ($r_data['act_promo_status'] == 1 && $r_data['activity'] == 10 && $r_data['act_returned'] == 0) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'APPLICANT to HOD' : 'APPLICANT to HOD';
                                                } elseif ($r_data['act_promo_status'] == 2 && $r_data['activity'] == 10 && $r_data['act_returned'] == 0) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'APPLICANT to DIRECTOR' : 'APPLICANT to DEAN';
                                                } elseif ($r_data['act_promo_status'] == 3 && $r_data['activity'] == 10 && $r_data['act_returned'] == 0) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'APPLICANT to REGISTRAR' : 'APPLICANT to PROVOST';
                                                } elseif ($r_data['act_promo_status'] == 4 && $r_data['activity'] == 10 && $r_data['act_returned'] == 0) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'APPLICANT to HR' : 'APPLICANT to HR';
                                                }elseif ($r_data['act_promo_status'] == 1 && $r_data['activity'] == 13 && $r_data['act_returned'] == 1) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'DIRECTOR to HOD and Applicant' : 'DEAN to HOD and Applicant';
                                                } elseif ($r_data['act_promo_status'] == 1 && $r_data['activity'] == 14 && $r_data['act_returned'] == 1) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'DIRECTOR to HOD' : 'DEAN to HOD';
                                                }elseif ($r_data['act_promo_status'] == 2 && $r_data['activity'] == 13 && $r_data['act_returned'] == 1) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'REGISTRAR to DIRECTOR and Applicant' : 'PROVOST to DEAN and Applicant';
                                                }elseif ($r_data['act_promo_status'] == 2 && $r_data['activity'] == 14 && $r_data['act_returned'] == 1) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'REGISTRAR to DIRECTOR' : 'PROVOST to DEAN';
                                                } elseif ($r_data['act_promo_status'] == 3 && $r_data['activity'] == 13 && $r_data['act_returned'] == 1) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'HR to REGISTRAR and Applicant' : 'HR to PROVOST and Applicant';
                                                }elseif ($r_data['act_promo_status'] == 3 && $r_data['activity'] == 14 && $r_data['act_returned'] == 0) {
                                                    echo $_SESSION['user']['staff_type'] == 'NON-ACADEMIC' ? 'HR to REGISTRAR and Applicant' : 'HR to PROVOST and Applicant';
                                                } else {
                                                    echo 'APPLICANT';
                                                }; ?>

                                            </a>
                                        </b>
                                    </p>
                                    <p><b><?php echo $r_data['stage_activity']; ?></b></p>
                                    <p><?php echo $r_data['act_comments']; ?></p>
                                    <?php if (!empty($r_data['updatedpapers'])) { ?>
                                        <a href="downloadup/<?php echo basename($r_data['updatedpapers']); ?>" class="text-darken-4 blue-text  btn white" data-toggle="tooltip" data-placement="top" title="<?php echo basename($r_data['stage_file']) ?>">
                                            Download Updated Papers
                                        </a>
                                    <?php }
                                    if (!empty($r_data['updatedcv'])) { ?>
                                        <a href="downloadup/<?php echo basename($r_data['updatedcv']); ?>" class="text-darken-4 blue-text  btn white" data-toggle="tooltip" data-placement="top" title="<?php echo basename($r_data['stage_file']) ?>">
                                            Download Updated CV
                                        </a>
                                    <?php } ?>

                                    <?php
                                    if ($r_data['act_promo_status'] == 2 && $r_data['activity'] == 1) {  ?>
                                        <?php if ($stagen == 0) {
                                        } else { ?>
                                            <a href="downloadfile_promos_app/<?php echo $r_data['activity_id']; ?>:stage_file" class="text-darken-4 blue-text  btn white" title="Download Letter">
                                                <i class="fa fa-download fa-2x"></i> HoD's Report
                                            </a>
                                        <?php } ?>
                                    <?php } ?>
                                    <?php if ($r_data['act_promo_status'] == 3 && $r_data['activity'] == 1) {  ?>
                                        <?php if ($stagen == 0) {
                                        } else { ?>
                                            <a href="downloadfile_promos_app/<?php echo $r_data['activity_id']; ?>:stage_file" class="text-darken-4 blue-text  btn white" data-toggle="tooltip" data-placement="top" title="<?php echo basename($r_data['stage_file']) ?>">
                                                <i class="fa fa-download fa-2x"></i>Confidential File Attached By
                                                <?= (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Deans' : 'Director') ?>
                                            </a>
                                        <?php } ?>
                                    <?php } ?>
                                    <?php if ($r_data['act_promo_status'] == 4 && $r_data['activity'] == 1) {  ?>
                                        <?php if ($stagen == 0) {
                                        } else { ?>
                                            <a href="downloadfile_promos_app/<?php echo $r_data['activity_id']; ?>:stage_file" class="text-darken-4 blue-text  btn white" data-toggle="tooltip" data-placement="top" title="<?php echo basename($r_data['stage_file']) ?>">
                                                <i class="fa fa-download fa-2x"></i>Confidential File Attached By
                                                <?= (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') ?>
                                            </a>
                                        <?php } ?>
                                    <?php } ?>
                                    <?php if ($r_data['act_promo_status'] == 7 && $r_data['activity'] == 1) {  ?>
                                        <a href="downloadfile_promos_app/<?php echo $r_data['activity_id']; ?>:stage_file" class="text-darken-4 blue-text  btn white" data-toggle="tooltip" data-placement="top" title="<?php echo basename($r_data['stage_file']) ?>">
                                            <i class="fa fa-download fa-2x"></i>File Attached By HR
                                        </a>
                                    <?php } ?>
                                </div>
                                <!-- </li> -->
                                <?php if ($r_data['act_promo_status'] == 5) {  ?>
                                    <?php
                                    if ($stagen == 1 || $stagen == 2) {
                                        if (!empty($r_data['assessor1'])) {
                                    ?>
                                            <!-- <li> -->
                                            <time class="cbp_tmtime"><span><?= $r_data['activity_date']; ?></span></time>
                                            <!-- <div class="cbp_tmicon bg-danger"><i class="fa fa-thumb-up"></i></div> -->
                                            <div class="cbp_tmlabel">
                                                <h5><a href="javascript:void(0);"><?= $r_data['stage_activity']; ?></a></h5>
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
                                            <!-- </li> -->
                                        <?php }
                                        if (!empty($r_data['assessor2'])) { ?>
                                            <!-- <li> -->
                                            <time class="cbp_tmtime"><span><?= $r_data['activity_date'] ?></span></time>
                                            <!-- <div class="cbp_tmicon bg-danger"><i class="fa fa-thumb-up"></i></div> -->
                                            <div class="cbp_tmlabel">
                                                <h5><a href="javascript:void(0);"><?= $r_data['stage_activity'] ?></a></h5>
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
                                            <!-- </li> -->
                                        <?php
                                        }
                                        if (!empty($r_data['assessor3'])) { ?>
                                            <!-- <li> -->
                                            <time class="cbp_tmtime"><span><?= $r_data['activity_date'] ?></span></time>
                                            <!-- <div class="cbp_tmicon bg-danger"><i class="fa fa-thumb-up"></i></div> -->
                                            <div class="cbp_tmlabel">
                                                <h5><a href="javascript:void(0);"><?= $r_data['stage_activity'] ?></a></h5>
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
                                            <!-- </li> -->
                                        <?php
                                        }
                                        if (!empty($r_data['assessor4'])) {
                                        ?>
                                            <!-- <li> -->
                                            <time class="cbp_tmtime"><span><?= $r_data['activity_date'] ?></span></time>
                                            <!-- <div class="cbp_tmicon bg-danger"><i class="fa fa-thumb-up"></i></div> -->
                                            <div class="cbp_tmlabel">
                                                <h5><a href="javascript:void(0);"><?= $r_data['stage_activity'] ?></a></h5>
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
                                            <!-- </li> -->
                                        <?php
                                        }

                                        if (!empty($r_data['assessor5'])) {
                                        ?>
                                            <!-- <li> -->
                                            <time class="cbp_tmtime"><span><?= $r_data['activity_date'] ?></span></time>
                                            <!-- <div class="cbp_tmicon bg-danger"><i class="fa fa-thumb-up"></i></div> -->
                                            <div class="cbp_tmlabel">
                                                <h5><a href="javascript:void(0);"><?= $r_data['stage_activity'] ?></a></h5>
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
                                            <!-- </li> -->
                                        <?php
                                        }

                                        if (!empty($r_data['assessor6'])) {
                                        ?>
                                            <!-- <li> -->
                                            <time class="cbp_tmtime"><span><?= $r_data['activity_date'] ?></span></time>
                                            <!-- <div class="cbp_tmicon bg-danger"><i class="fa fa-thumb-up"></i></div> -->
                                            <div class="cbp_tmlabel">
                                                <h5><a href="javascript:void(0);"><?= $r_data['stage_activity'] ?></a></h5>
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
                                            <!-- </li> -->
                                        <?php
                                        } ?>

                                        <?php
                                    } else {
                                        if (!empty($r_data['assessor1'])) {
                                        ?>
                                            <!-- <li> -->
                                            <time class="cbp_tmtime"><span><?= $r_data['activity_date'] ?></span></time>
                                            <!-- <div class="cbp_tmicon bg-danger"><i class="fa fa-thumb-up"></i></div> -->
                                            <div class="cbp_tmlabel">
                                                <h5><a href="javascript:void(0);"><?= $r_data['stage_activity'] ?></a></h5>
                                                <blockquote>
                                                    <p class="blockquote blockquote-primary">
                                                        <?= $r_data['act_comments'] ?>
                                                        <br>
                                                    </p>
                                                </blockquote>
                                            </div>
                                            <!-- </li> -->
                                    <?php
                                        }
                                    } ?>
                                <?php } ?>
                            </div>
                        </div>
                    </div>
            <?php }
            } ?>

        </div>
    </div>

</section>




<script src="public/js/main.js"></script>