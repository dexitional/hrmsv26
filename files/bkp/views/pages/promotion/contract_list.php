<section class="section">
    <div class="row">
        <div class="col s12">
            <h5 class="blue-text text-darken-2">
                Staff Contract Renewal List
            </h5>
            <div class="divider"></div>
        </div>
    </div>

    <div id="notice"></div>

    <div class="row">
        <div class="col s12">
            <div class="card">
                <div class="card-content">
                    <span class="card-title">Applications</span>

                    <div class="responsive-table">
                        <table id="row-group-tbl-promo" class="display">

                        <!-- <table id="contractTable" class="highlight striped"> -->
                            <thead>
                                <tr>
                                    <th>Action</th>
                                    <th>Media</th>
                                    <th>Staff ID</th>
                                    <th>Name</th>
                                    <th>Position Applied</th>
                                    <th>Date Applied</th>
                                    <th>Progress/Status</th>
                                    <th>Documents</th>
                                </tr>
                            </thead>
                            <tbody>
                            <?php foreach($data as $promo):?>                                    
                                <tr>
                                    <td>
                                        <a href='javascript:void(0);' data-original-title="View & Download Documents" class='btn waves-effect waves-light chip lighten-5 text-darken-2 green blue-text mr-1 mb-1 promo_data' data-sno="<?= $_SESSION['user']['staff_no'] ?>" data-pid="<?= $promo['promotion_id'] . ',' . '0' ?>" title="View & Download Documents">
                                        <i class="fas fa-file me-1"></i></a>
                                        <?php if (!empty($promo['pd_id'])) { ?>
                                        <a onclick="Popup=window.open('printpage_new/<?= $promo['promotion_id'] ?>','Popup','toolbar=no,location=0,status=no,menubar=yes,scrollbars=yes,resizable=no, width=800,height=1000,left=400,top=250' ).focus(); return false;" class="btn waves-effect waves-light chip lighten-5 text-darken-4 blue blue-text mr-1 mb-1" href="javascript(void)">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <?php } ?>
                                        <?php if ($promo['stage_status'] >= 8 && $promo['returned'] == 1) : ?>
                                        <!-- <a href='/promo_apply_sm' class='btn waves-effect waves-light chip lighten-5 text-darken-2 green blue-text mr-1 mb-1' data-target="#returnonepp" title="Upload Updated Document(s)" data-id="<?php echo $promo['promotion_id']; ?>" data-entry="<?= $promo['promo_status'] . ',' . $promo['stage_status']; ?>">
                                            <i class="fas fa-reply me-1"></i></a> -->
                                        <a href='javascript:void(0);' class='btn waves-effect waves-light chip lighten-5 text-darken-2 green blue-text mr-1 mb-1 promo_update_data' title="Upload Updated Document(s)" data-sno="<?= $_SESSION['user']['staff_no'] ?>" data-id="<?php echo $promo['promotion_id']; ?>" data-entry="<?= $promo['promo_status'] . ',' . $promo['stage_status']; ?>">
                                            <i class="fas fa-reply me-1"></i></a>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <img src="../../public/images/avatar3.png"
                                             class="circle responsive-img"
                                             width="40">
                                    </td>

                                    <td class="blue-text text-darken-2">
                                        <?php echo $promo['staff_no']; ?>
                                    </td>

                                    <td>
                                        <?php echo $promo['fname'].' '.$promo['lname']; ?>
                                    </td>

                                    <td><?php echo $promo['title']; ?></td>
                                    <td><?php echo $promo['activity_date']; ?></td>


                                    <!-- Status -->
                                    <td>
                                    <?php
                                            $progress = [1=>5,2=>20,3=>40,4=>50,5=>70,6=>90,7=>100];
                                            $percent = $progress[$promo['promo_status']] ?? 0;
                                        ?>
                                        <div class="progress grey lighten-3">
                                            <div class="determinate blue"
                                                 style="width: <?php echo $percent; ?>%">
                                            </div>
                                        </div>
                                        <small><?php echo $percent; ?>%</small>
                                        <br>
                                        
                                        <small class="chip lighten-5 text-darken-2 
                                            <?= ($promo['promo_status'] == 1 ? 'green green-text ' : ($promo['promo_status'] == 2 ? 'amber amber-text' : ($promo['promo_status'] == 3 ? 'purple purple-text' : ($promo['promo_status'] == 4 ? 'orange orange-text' : ($promo['promo_status'] == 5 ? 'bpromon bpromon-text' : ($promo['promo_status'] == 6 ? 'amber dark-grey-text' : ($promo['promo_status'] == 7 ? 'orange orange-text' : 'blue blue-text'))))))); ?>">
                                            <b><?php if ($promo['promo_status'] == 1) : ?>
                                                <?php
                                                    if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                    echo 'Received by HoD';
                                                    } elseif ($promo['stage_status'] == 2) {
                                                    echo 'Not qualified contact HoD';
                                                    } elseif ($promo['stage_status'] == 0) {
                                                    echo 'Received by HoD';
                                                    } elseif ($promo['stage_status'] == 8) {
                                                    echo 'HOD is Awaiting CV Update';
                                                    } elseif ($promo['stage_status'] == 9) {
                                                    echo 'HOD is Awaiting Papers Update';
                                                    } elseif ($promo['stage_status'] == 10) {
                                                    echo 'HOD is Awaiting  CV, Application Form & Papers Update';
                                                    } elseif ($promo['stage_status'] == 11) {
                                                    echo 'HOD is Awaiting Application Form Update';
                                                    }
                                                ?>

                                                <?php elseif ($promo['promo_status'] == 2) : ?>
                                                <?php
                                                    if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                    echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Approved & forwarded to Dean' : 'Approved & forwarded to Director');
                                                    } elseif ($promo['stage_status'] == 2) {
                                                    echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Not qualified contact Dean' : 'Not qualified contact Director');
                                                    } elseif ($promo['stage_status'] == 8) {
                                                    echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' Awaiting CV Update';
                                                    } elseif ($promo['stage_status'] == 9) {
                                                    echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' Awaiting Papers Update';
                                                    } elseif ($promo['stage_status'] == 10) {
                                                    echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' Awaiting  CV, Application Form & Papers Update';
                                                    } elseif ($promo['stage_status'] == 11) {
                                                    echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' Awaiting Application Form Update';
                                                    }
                                                ?>

                                                <?php elseif ($promo['promo_status'] == 3) : ?>
                                                <?php
                                                    if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                    echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Approved & forwarded to Provost' : 'Approved & forwarded to Registrar');
                                                    } elseif ($promo['stage_status'] == 2) {
                                                    echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Not qualified contact Provost' : 'Not qualified contact Registrar');
                                                    } elseif ($promo['stage_status'] == 3) {
                                                    echo 'Assigned To Assessor(s)';
                                                    } elseif ($promo['stage_status'] == 8) {
                                                    echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . ' Awaiting CV Update';
                                                    } elseif ($promo['stage_status'] == 9) {
                                                    echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . ' Awaiting Papers Update';
                                                    } elseif ($promo['stage_status'] == 10) {
                                                    echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . ' Awaiting  CV, Application Form & Papers Update';
                                                    } elseif ($promo['stage_status'] == 11) {
                                                    echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . ' Awaiting Application Form Update';
                                                    }
                                                ?>

                                                <?php elseif ($promo['promo_status'] == 4) : ?>
                                                <?php
                                                    if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                    echo 'Approved & forwarded to HR';
                                                    } elseif ($promo['stage_status'] == 2) {
                                                    echo 'Not qualified contact HR';
                                                    } elseif ($promo['stage_status'] == 3) {
                                                    echo 'Assigned to Assessor(s)';
                                                    } elseif ($promo['stage_status'] == 8) {
                                                    echo 'HR is Awaiting CV Update';
                                                    } elseif ($promo['stage_status'] == 9) {
                                                    echo 'HR is Awaiting Papers Update';
                                                    } elseif ($promo['stage_status'] == 10) {
                                                    echo 'HR is Awaiting  CV, Application Form & Papers Update';
                                                    } elseif ($promo['stage_status'] == 11) {
                                                    echo 'HR is Awaiting Application Form Update';
                                                    }
                                                ?>
                                                <?php elseif ($promo['promo_status'] == 5) : ?>
                                                <?php
                                                    if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                    echo 'Assigned To Assessor(s)';
                                                    } elseif ($promo['stage_status'] == 2) {
                                                    echo 'Not qualified contact HR';
                                                    } elseif ($promo['stage_status'] == 3) {
                                                    echo 'Assigned to Assessor(s)';
                                                    } elseif ($promo['stage_status'] == 8) {
                                                    echo 'HR is Awaiting CV Update';
                                                    } elseif ($promo['stage_status'] == 9) {
                                                    echo 'HR is Awaiting Papers Update';
                                                    } elseif ($promo['stage_status'] == 10) {
                                                    echo 'HR is Awaiting  CV, Application Form & Papers Update';
                                                    } elseif ($promo['stage_status'] == 10) {
                                                    echo 'HR is Awaiting Application Form Update';
                                                    }
                                                ?>
                                                <?php elseif ($promo['promo_status'] == 6) : ?>
                                                <?php
                                                    if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                    echo 'Approved & Promoted by HR';
                                                    } elseif ($promo['stage_status'] == 2) {
                                                    echo 'Not qualified contact HR';
                                                    } elseif ($promo['stage_status'] == 3) {
                                                    echo 'Assigned to Assessor(s)';
                                                    } elseif ($promo['stage_status'] == 8) {
                                                    echo 'HR is Awaiting CV Update';
                                                    } elseif ($promo['stage_status'] == 9) {
                                                    echo 'HR is Awaiting Papers Update';
                                                    } elseif ($promo['stage_status'] == 10) {
                                                    echo 'HR is Awaiting  CV, Application Form & Papers Update';
                                                    } elseif ($promo['stage_status'] == 11) {
                                                    echo 'HR is Awaiting Application Form Update';
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
                                                    echo 'HR is Awaiting CV Update';
                                                    } elseif ($promo['stage_status'] == 9) {
                                                    echo 'HR is Awaiting Papers Update';
                                                    } elseif ($promo['stage_status'] == 10) {
                                                    echo 'HR is Awaiting  CV, Application Form & Papers Update';
                                                    } elseif ($promo['stage_status'] == 10) {
                                                    echo 'HR is Awaiting Application Form Update';
                                                    }
                                                ?>
                                                <?php endif; ?>
                                            </b></small>
                                    </td>

                                    <!-- Documents -->
                                    <td>
                                        <a href="downloadfile1/<?php echo $promo['promotion_id'];?>"
                                           class="btn-floating btn-small blue tooltipped"
                                           data-tooltip="<?php echo basename($promo['promo_doc1'])?>">
                                            <i class="material-icons">download</i>
                                        </a>

                                        <a href="downloadfile/<?php echo $promo['promotion_id'];?>"
                                           class="btn-floating btn-small blue tooltipped"
                                           data-tooltip="<?php echo basename($promo['promo_doc2'])?>">
                                            <i class="material-icons">download</i>
                                        </a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    </div>
</section>
