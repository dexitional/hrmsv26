<?php $headtype = isset($_SESSION['headtype']) ? $_SESSION['headtype'] : (isset($_SESSION['user']['type']) ? $_SESSION['user']['type'] : ''); ?>
<style>
    .card .card-content {
        padding: 24px;
        overflow: scroll;
    }

    .action-filters {
        -webkit-box-flex: .95;
        -webkit-flex-grow: .95;
        -ms-flex-positive: .95;
        flex-grow: .95;
    }

    #main .section-data-tables .dataTables_wrapper .dataTables_filter,
    #main .section-data-tables .dataTables_wrapper .dataTables_length {
        display: block;
        width: 100%;
        padding-right: 30px;
        border-bottom: 2px dashed #ccc;
    }

    .dataTables_filter label input[type=search] {
        height: 3.2rem;
        margin: 0 0 15px;
        padding-left: 1.5rem;
        border: 1px solid #9e9e9e !important;
        border-bottom: none;
        border-radius: 150px;
        background: #f1f2f3;
    }

    .dataTables_filter label {
        position: relative;

    }

    .dataTables_filter label:after {
        content: '';
    }
</style>

<div class="section section-data-tables">
    <div id="button-trigger2" class="card card card-default scrollspy">
        <div class="card-content">
            <a href='javascript:void(0);' class='btn waves-effect waves-light chip lighten-5 text-darken-2 blue text-darken-4 blue-text mr-1 mb-1 add_assessor' id="add_assessor" title="Add Assessor" data-uid="<?= $data['unit_college'] ?>" data-entry="4,3">
                <i class="fas fa-plus me-1"></i>Add Assessor</a>
            <h5 class="card-title light-blue-text text-darken-4 mt-5 text-uppercase">Promotion List, <?= (($headtype == 'ACADEMIC') ? 'PROVOST' : 'REGISTRAR') ?> <br>
                <small class="text-muted">Welcome! You can act on promotions here</small>
            </h5>
      <marquee behavior="left" direction=""><h5>For enquires call or whatsapp: 0203556742 </h5></marquee>
      
      <?php if (isset($_SESSION['slim.flash']['error'])) { ?>
                <div class="card-alert card red lighten-5 center border-round" id="msg">
                    <div class="card-content red-text">
                        <small><b><?= strtoupper($_SESSION['slim.flash']['error']); ?></b></small>
                    </div>
                    <button type="button" class="close red-text" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
            <?php } ?>
            <?php if (isset($_SESSION['slim.flash']['success'])) { ?>
                <div class="card-alert card green blue-text lighten-5 center border-round" id="msg">
                    <div class="card-content red-text">
                        <small><b><?= strtoupper($_SESSION['slim.flash']['success']); ?></b></small>
                    </div>
                    <button type="button" class="close red-text" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
            <?php } ?>

            <div class="clear"></div>

            <div class="responsive-table">

                <table id="row-group-tbl-promo" class="display">
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Status</th>
                            <th>Media</th>
                            <th>Staff ID</th>
                            <th>Name</th>
                            <th>Position Applied</th>
                            <th>Date Applied</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        if (count($data['positions']) > 0) {
                            // foreach ($data as $promo) {
                        ?>
                            <?php foreach ($data['positions'] as $promo) : ?>
                                <tr>
                                    <td>
                                        <a href='javascript:void(0);' class='btn waves-effect waves-light chip lighten-5 text-darken-2 green blue-text mr-1 mb-1 promo_data' data-sno="<?= $promo['staff_no'] ?>" data-pid="<?= $promo['promotion_id'] . ',' . '2' ?>" title="View & Download Documents">
                                            <i class="fas fa-file me-1"></i></a>

                                        <?php //if (!empty($promo['pd_id'])) { ?>
                                            
                                        <?php //} ?>

                                        <?php if ($promo['stage_status'] == 2) : ?>
                                            <a href='javascript:void(0);' class='btn waves-effect waves-light chip lighten-5 text-darken-2 blue green-text mr-1 mb-1 promo_approve' disabled data-original-title="Approve/Disapprove" title="Take Action" data-sno="<?= $promo['staff_no'] ?>" data-id="<?php echo $promo['promotion_id']; ?>" data-entry="7">
                                                <i class="fas fa-thumbs-up me-1"></i></a>
                                        <?php elseif ($promo['stage_status'] == 1 || $promo['stage_status'] == 3) : ?>
                                            <a href='javascript:void(0);' class='btn waves-effect waves-light chip lighten-5 text-darken-2 blue green-text mr-1 mb-1 promo_approve' <?= (($promo['promo_status'] > 3) ? 'disabled' : '') ?> data-original-title="Approve/Disapprove" data-sno="<?= $promo['staff_no'] ?>" title="Take Action" data-id="<?php echo $promo['promotion_id']; ?>" data-entry="4,3">
                                                <i class="fas fa-thumbs-up me-1"></i></a>
                                                <a onclick="Popup=window.open('printpage_new/<?= $promo['promotion_id'] ?>','Popup','toolbar=no,location=0,status=no,menubar=yes,scrollbars=yes,resizable=no, width=800,height=1000,left=400,top=250' ).focus(); return false;" class="btn waves-effect waves-light chip lighten-5 text-darken-4 blue blue-text mr-1 mb-1" href="javascript(void)">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <a href='javascript:void(0);' class='btn waves-effect waves-light chip chip lighten-5 text-darken-2 cyan cyan-text mr-1 mb-1 promo_reverse' <?= (($promo['promo_status'] > 3) ? 'disabled' : '') ?> data-sno="<?= $promo['staff_no'] ?>" title="Return form to applicant" data-id="<?php echo $promo['promotion_id']; ?>" data-entry="3">
                                                <i class="fas fa-reply me-1"></i></a>
                                            <a href='javascript:void(0);' class='btn waves-effect waves-light chip chip lighten-5 text-darken-2 cyan cyan-text mr-1 mb-1 assign_assessor' title="Assign Assessor" <?= (($promo['promo_status'] > 3) ? 'disabled' : '') ?> data-id="<?php echo $promo['promotion_id']; ?>">
                                                <i class="fas fa-plus me-1"></i>
                                            </a>
                                        <?php elseif ($promo['stage_status'] == 0 && $promo['promo_status'] == 3) : ?>
                                            <a onclick="Popup=window.open('printpage_new/<?= $promo['promotion_id'] ?>','Popup','toolbar=no,location=0,status=no,menubar=yes,scrollbars=yes,resizable=no, width=800,height=1000,left=400,top=250' ).focus(); return false;" class="btn waves-effect waves-light chip lighten-5 text-darken-4 blue blue-text mr-1 mb-1" href="javascript(void)">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <a href='javascript:void(0);' class='btn waves-effect waves-light chip lighten-5 text-darken-2 cyan green-text mr-1 mb-1 promo_approve' title="Approve/Disapprove" data-sno="<?= $promo['staff_no'] ?>" data-id="<?php echo $promo['promotion_id']; ?>" data-entry="4,3">
                                                <i class="fas fa-thumbs-up me-1"></i></a>
                                            <a href='javascript:void(0);' class='btn waves-effect waves-light chip chip lighten-5 text-darken-2 cyan cyan-text mr-1 mb-1 promo_reverse' data-original-title="Take Action" title="Return form to applicant" data-sno="<?= $promo['staff_no'] ?>" data-id="<?php echo $promo['promotion_id']; ?>" data-entry="3">
                                                <i class="fas fa-reply me-1"></i></a>
                                        <?php endif; ?>

                                    </td>
                                    <td><small class="chip lighten-5 text-darken-2 
                                        <?= ($promo['promo_status'] == 1 ? 'green green-text ' : ($promo['promo_status'] == 2 ? 'amber amber-text' : ($promo['promo_status'] == 3 ? 'purple white-text' : ($promo['promo_status'] == 4 ? 'orange orange-text' : ($promo['promo_status'] == 5 ? 'brown brown-text' : ($promo['promo_status'] == 6 ? 'amber dark-grey-text' : ($promo['promo_status'] == 7 ? 'orange cyan-text' : 'blue blue-text'))))))); ?>">
                                            <b>
                                                <?php if ($promo['promo_status'] == 1) : ?>
                                                    <?php
                                                    if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                        echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Received by HoD' : 'Received by HoD');
                                                    } elseif ($promo['stage_status'] == 2) {
                                                        echo 'Not qualified, HoD disapproved';
                                                    } elseif ($promo['stage_status'] == 0) {
                                                        echo 'Received by HoD';
                                                    } elseif ($promo['stage_status'] == 8) {
                                                        echo 'Awaiting CV Update';
                                                    } elseif ($promo['stage_status'] == 11) {
                                                        echo 'Awaiting Application Form Update';
                                                    } elseif ($promo['stage_status'] == 9) {
                                                        echo 'Awaiting Papers Update';
                                                    } elseif ($promo['stage_status'] == 10) {
                                                        echo 'Awaiting Both CV, Application Form & Papers Update';
                                                    }elseif ($promo['stage_status'] == 14) {
                                                        echo 'Reversed from HR to '.(($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar').' and applicant';
                                                    }elseif ($promo['stage_status'] == 13) {
                                                        echo 'Reversed from HR to '.(($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar').'';
                                                    }
                                                    ?>

                                                <?php elseif ($promo['promo_status'] == 2) : ?>
                                                    <?php
                                                    if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                        echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Approved & forwarded to Dean' : 'Approved & forwarded to Director');
                                                    } elseif ($promo['stage_status'] == 2) {
                                                        echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Not qualified, Dean disapproved' : 'Not qualified, Director disapproved');
                                                    } elseif ($promo['stage_status'] == 8) {
                                                        echo 'Awaiting CV Update';
                                                    } elseif ($promo['stage_status'] == 11) {
                                                        echo 'Awaiting Application Form Update';
                                                    } elseif ($promo['stage_status'] == 9) {
                                                        echo 'Awaiting Papers Update';
                                                    } elseif ($promo['stage_status'] == 10) {
                                                        echo 'Awaiting Both CV, Application Form & Papers Update';
                                                    }elseif ($promo['stage_status'] == 14) {
                                                        echo 'Reversed from HR to '.(($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar').' and applicant';
                                                    }elseif ($promo['stage_status'] == 13) {
                                                        echo 'Reversed from HR to '.(($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar').'';
                                                    }
                                                    ?>
                                                <?php elseif ($promo['promo_status'] == 3) : ?>
                                                    <a href="#" class="badge badge-danger">
                                                        <?php
                                                        if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                            echo 'Awaiting your feedback';
                                                        } elseif ($promo['stage_status'] == 2) {
                                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Disapprove by Provost' : 'Disapprove by Registrar');
                                                        } elseif ($promo['stage_status'] == 3) {
                                                            echo 'Assigned To Assessor(s)';
                                                        } elseif ($promo['stage_status'] == 8) {
                                                            echo 'Awaiting CV Update';
                                                        } elseif ($promo['stage_status'] == 11) {
                                                            echo 'Awaiting Application Form Update';
                                                        } elseif ($promo['stage_status'] == 9) {
                                                            echo 'Awaiting Papers Update';
                                                        } elseif ($promo['stage_status'] == 10) {
                                                            echo 'Awaiting Both CV, Application Form & Papers Update';
                                                        }elseif ($promo['stage_status'] == 14) {
                                                        echo 'Reversed from HR to '.(($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar').' and applicant';
                                                    }elseif ($promo['stage_status'] == 13) {
                                                        echo 'Reversed from HR to '.(($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar').'';
                                                    }
                                                        ?>
                                                    <?php elseif ($promo['promo_status'] == 4) : ?>
                                                        <a href="#" class="badge badge-primary">
                                                            <?php
                                                            if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                                echo 'Approved & forwarded to HR';
                                                            } elseif ($promo['stage_status'] == 2) {
                                                                echo 'Not qualified, HR disapproved';
                                                            } elseif ($promo['stage_status'] == 3) {
                                                                echo 'Assigned to Assessor(s)';
                                                            } elseif ($promo['stage_status'] == 8) {
                                                                echo 'Awaiting CV Update';
                                                            } elseif ($promo['stage_status'] == 11) {
                                                                echo 'Awaiting Application Form Update';
                                                            } elseif ($promo['stage_status'] == 9) {
                                                                echo 'Awaiting Papers Update';
                                                            } elseif ($promo['stage_status'] == 10) {
                                                                echo 'Awaiting Both CV, Application Form & Papers Update';
                                                            }
                                                            ?>
                                                        </a>
                                                    <?php elseif ($promo['promo_status'] == 5) : ?>
                                                        <?php
                                                        if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                            echo 'Assigned To Assessor(s)';
                                                        } elseif ($promo['stage_status'] == 2) {
                                                            echo 'Not qualified, HR disapproved';
                                                        } elseif ($promo['stage_status'] == 3) {
                                                            echo 'Assigned to Assessor(s)';
                                                        } elseif ($promo['stage_status'] == 8) {
                                                            echo 'Awaiting CV Update';
                                                        } elseif ($promo['stage_status'] == 11) {
                                                            echo 'Awaiting Application Form Update';
                                                        } elseif ($promo['stage_status'] == 9) {
                                                            echo 'Awaiting Papers Update';
                                                        } elseif ($promo['stage_status'] == 10) {
                                                            echo 'Awaiting Both CV, Application Form & Papers Update';
                                                        }
                                                        ?>
                                                    <?php elseif ($promo['promo_status'] == 6) : ?>
                                                        <?php
                                                        if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                            echo 'Approved & forwarded to HR';
                                                        } elseif ($promo['stage_status'] == 2) {
                                                            echo 'Not qualified, HR disapproved';
                                                        } elseif ($promo['stage_status'] == 3) {
                                                            echo 'Assigned to Assessor(s)';
                                                        } elseif ($promo['stage_status'] == 8) {
                                                            echo 'Awaiting CV Update';
                                                        } elseif ($promo['stage_status'] == 11) {
                                                            echo 'Awaiting Application Form Update';
                                                        } elseif ($promo['stage_status'] == 9) {
                                                            echo 'Awaiting Papers Update';
                                                        } elseif ($promo['stage_status'] == 10) {
                                                            echo 'Awaiting Both CV, Application Form & Papers Update';
                                                        }
                                                        ?>
                                                    <?php elseif ($promo['promo_status'] == 7) : ?>
                                                        <?php
                                                        if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                            echo 'Approved & Promoted';
                                                        } elseif ($promo['stage_status'] == 2) {
                                                            echo 'Not Qualified';
                                                        } elseif ($promo['stage_status'] == 3) {
                                                            echo 'Assigned to Assessor(s)';
                                                        } elseif ($promo['stage_status'] == 8) {
                                                            echo 'Awaiting CV Update';
                                                        } elseif ($promo['stage_status'] == 11) {
                                                            echo 'Awaiting Application Form Update';
                                                        } elseif ($promo['stage_status'] == 9) {
                                                            echo 'Awaiting Papers Update';
                                                        } elseif ($promo['stage_status'] == 10) {
                                                            echo 'Awaiting Both CV, Application Form & Papers Update';
                                                        }
                                                        ?>
                                                    </a>
                                                <?php endif; ?>
                                            </b></small>
                                    </td>
                                    <td>
                                        <span class="list-icon">
                                            <img src="https://cdn.ucc.edu.gh/photos/?tag=<?php echo $promo['staff_no']; ?>" style="height:40px;display:block;margin:0 auto;border-radius:50%" onclick="window.open('https://cdn.ucc.edu.gh/photos/?tag=<?php echo $promo['staff_no']; ?>')" />
                                        </span>
                                    </td>
                                    <td><span class="light-blue-text text-darken-4"><?php echo $promo['staff_no']; ?></span></td>
                                    <td class="light-blue-text text-darken-4"><?php echo $promo['fname'] . ' ' . $promo['lname']; ?></td>
                                    <td><?php echo $promo['title']; ?></td>
                                    <td><?php echo $promo['activity_date']; ?></td>

                                </tr>
                        <?php
                            endforeach;
                        }
                        ?>

                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>