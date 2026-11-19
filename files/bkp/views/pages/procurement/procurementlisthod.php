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
<?php //var_dump($_SESSION['advisers']);
?>
<div class="section section-data-tables">

    <div class="row">
        <div class="col s12 m12 l12">
            <div id="button-trigger2" class="card card card-default scrollspy">
                <div class="card-content">
                    <h4 class="card-title">Procurement List, Head of Department</h4>
                    <div class="row">
                        <div class="col s12">
                            <p>Welcome! You can act on procurement here...</p>
                        </div><br><br>
                        <div class="col s12">
                            <div class="responsive-table">
                                <!-- <table class="table invoice-data-table white border-radius-4 pt-1"> -->
                                <!-- <table class="table table-striped table-hover table-border table-sm"> -->
                                <table id="row-group-tbl-procure" class="display">
                                    <thead>
                                        <tr role="row">
                                            <th>Action</th>
                                            <th>Date Submitted</th>
                                            <th>Staff ID</th>
                                            <th>Total Cost</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php
                                        if (count($data['positions']) > 0) {
                                            foreach ($data['positions'] as $promo) {
                                        ?>
                                                <tr>
                                                    <td>
                                                        <!-- <img src="<?= $promo['date_added']; ?>" style="height:40px;display:block;margin:0 auto;border-radius:50%" onclick="window.open('<?= $promo['date_added']; ?>')" /> -->
                                                        <!-- <a href="javascript:void(0);" class='btn waves-effect waves-light chip lighten-5 text-darken-2 blue green-text mr-1 mb-1 right check_list' onclick="procuremodal_view(<?php echo $promo['request_id']; ?>)" title="View Procurement List" data-id="<?php echo $promo['request_id']; ?>" data-entry="<?= ($headtype == 'ACADEMIC') ? '2' : '3' ?>">
                                                            <i class="material-icons">edit</i></a> -->
                                                        <a href='#' data-original-title="Take Action" title="View List" class='btn waves-effect waves-light chip lighten-5 text-darken-2 blue green-text mr-1 mb-1 right check_list' data-sno="<?= $promo['request_id'] ?>" data-id="<?php echo $promo['request_id']; ?>" data-entry="<?= $promo['stage'] . ',' . $promo['stage_status']; ?>">
                                                            <i class="material-icons">list</i>
                                                            <!-- <i class="fas fa-list me-1"></i> -->
                                                        </a>
                                                        <a href='#' data-original-title="Take Action" title="View Stages" class='btn waves-effect waves-light chip lighten-5 text-darken-2 green blue-text mr-1 mb-1 right check_stages' data-sno="<?= $promo['request_id'] ?>" data-id="<?php echo $promo['request_id']; ?>" data-entry="<?= $promo['stage'] . ',' . $promo['stage_status']; ?>">
                                                            <i class="material-icons">thumbs_up_down
                                                            </i>
                                                            <!-- <i class="fas fa-eye me-1"></i> -->
                                                        </a>
                                                    </td>
                                                    <td><strong><?php echo $promo['date_added']; ?><strong></td>
                                                    <td><strong><?php echo $promo['staff_no']; ?><strong></td>
                                                    <td><strong><?php echo $promo['total_price']; ?><strong></td>
                                                    <td>
                                                        <strong class="chip lighten-5 text-darken-2 
                                                            <?= ($promo['stage'] == 1 ? 'waves-effect waves-light chip lighten-5 text-darken-2 green green-text' : ($promo['stage'] == 2 ? 'waves-effect waves-light chip lighten-5 text-darken-2 blue blue-text' : ($promo['stage'] == 3 ? 'waves-effect waves-light chip lighten-5 text-darken-2 purple purple-text' : ($promo['stage'] == 4 ? ' waves-effect waves-light chip lighten-5 text-darken-2 orange orange-text' : ($promo['stage'] == 5 ? 'waves-effect waves-light chip lighten-5 text-darken-2 bpromon bpromon-text' : ($promo['stage'] == 6 ? 'waves-effect waves-light chip lighten-5 text-darken-2 amber amber-text' : ($promo['stage'] == 7 ? 'waves-effect waves-light chip lighten-5 text-darken-2 cyan cyan-text' : 'waves-effect waves-light chip lighten-5 text-darken-2 amber amber-text'))))))); ?>">
                                                            <?php if ($promo['stage'] == 1) : ?>
                                                                <b>
                                                                    <?php
                                                                    if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                                        echo (($headtype == 'ACADEMIC') ? 'Forwarded to Dean' : 'Forwarded to Director');
                                                                    } elseif ($promo['stage_status'] == 2) {
                                                                        echo (($headtype == 'ACADEMIC') ? 'Dean disapproved' : 'Director disapproved');
                                                                    } elseif ($promo['stage_status'] == 4) {
                                                                        echo 'Review/Comments Given';
                                                                    } elseif ($promo['stage_status'] == 8) {
                                                                        echo 'Awaiting CV Update';
                                                                    } elseif ($promo['stage_status'] == 9) {
                                                                        echo 'Awaiting Papers Update';
                                                                    } elseif ($promo['stage_status'] == 10) {
                                                                        echo 'Awaiting Both CV & Papers Update';
                                                                    }
                                                                    ?>

                                                                <?php elseif ($promo['stage'] == 2) : ?>
                                                                    <?php
                                                                    if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                                        echo (($headtype == 'ACADEMIC') ? 'Approved & forwarded to Provost' : 'Approved & forwarded to Registrar');
                                                                    } elseif ($promo['stage_status'] == 2) {
                                                                        echo (($headtype == 'ACADEMIC') ? 'Provost disapproved' : 'Registrar disapproved');
                                                                    } elseif ($promo['stage_status'] == 3) {
                                                                        echo 'Review/Comments Given';
                                                                    } elseif ($promo['stage_status'] == 4) {
                                                                        echo 'Review/Comments Given';
                                                                    } elseif ($promo['stage_status'] == 8) {
                                                                        echo 'Awaiting CV Update';
                                                                    } elseif ($promo['stage_status'] == 9) {
                                                                        echo 'Awaiting Papers Update';
                                                                    } elseif ($promo['stage_status'] == 10) {
                                                                        echo 'Awaiting Both CV & Papers Update';
                                                                    }
                                                                    ?>

                                                                <?php elseif ($promo['stage'] == 3) : ?>
                                                                    <?php
                                                                    if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                                        echo 'Approved & forwarded to VC';
                                                                    } elseif ($promo['stage_status'] == 2) {
                                                                        echo 'VC disapproved';
                                                                    } elseif ($promo['stage_status'] == 3) {
                                                                        echo 'Forwarded For Review/Comment';
                                                                    } elseif ($promo['stage_status'] == 4) {
                                                                        echo 'Review/Comments Given';
                                                                    } elseif ($promo['stage_status'] == 8) {
                                                                        echo 'Review/Comments Given';
                                                                    } elseif ($promo['stage_status'] == 8) {
                                                                        echo 'Awaiting CV Update';
                                                                    } elseif ($promo['stage_status'] == 9) {
                                                                        echo 'Awaiting Papers Update';
                                                                    } elseif ($promo['stage_status'] == 10) {
                                                                        echo 'Awaiting Both CV & Papers Update';
                                                                    }
                                                                    ?>
                                                                <?php elseif ($promo['stage'] == 4) : ?>
                                                                    <?php
                                                                    if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                                        echo 'Forwarded to Procurement Office';
                                                                    } elseif ($promo['stage_status'] == 2) {
                                                                        echo 'Procurement Office disapproved';
                                                                    } elseif ($promo['stage_status'] == 3) {
                                                                        echo 'Forwarded For Review/Comment';
                                                                    } elseif ($promo['stage_status'] == 4) {
                                                                        echo 'Review/Comments Given';
                                                                    } elseif ($promo['stage_status'] == 5) {
                                                                        echo 'Grouping Done By Procurement';
                                                                    } elseif ($promo['stage_status'] == 6) {
                                                                        echo 'Supplier Quotations Given';
                                                                    } elseif ($promo['stage_status'] == 7) {
                                                                        echo 'Supplier Recommended';
                                                                    } elseif ($promo['stage_status'] == 8) {
                                                                        echo 'Awaiting CV Update';
                                                                    } elseif ($promo['stage_status'] == 9) {
                                                                        echo 'Awaiting Papers Update';
                                                                    } elseif ($promo['stage_status'] == 10) {
                                                                        echo 'Awaiting Both CV & Papers Update';
                                                                    }
                                                                    ?>
                                                                <?php elseif ($promo['stage'] == 5) : ?>
                                                                    <?php
                                                                    if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                                        echo 'Assigned To Assessor(s)';
                                                                    } elseif ($promo['stage_status'] == 2) {
                                                                        echo 'Not qualified, HR disapproved';
                                                                    } elseif ($promo['stage_status'] == 3) {
                                                                        echo 'Review/Comments Given';
                                                                    } elseif ($promo['stage_status'] == 4) {
                                                                        echo 'Review/Comments Given';
                                                                    } elseif ($promo['stage_status'] == 8) {
                                                                        echo 'Awaiting CV Update';
                                                                    } elseif ($promo['stage_status'] == 9) {
                                                                        echo 'Awaiting Papers Update';
                                                                    } elseif ($promo['stage_status'] == 10) {
                                                                        echo 'Awaiting Both CV & Papers Update';
                                                                    }
                                                                    ?>
                                                                <?php elseif ($promo['stage'] == 6) : ?>
                                                                    <?php
                                                                    if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                                        echo 'Approved & forwarded to HR';
                                                                    } elseif ($promo['stage_status'] == 2) {
                                                                        echo 'Not qualified, HR disapproved';
                                                                    } elseif ($promo['stage_status'] == 3) {
                                                                        echo 'Review/Comments Given';
                                                                    } elseif ($promo['stage_status'] == 4) {
                                                                        echo 'Review/Comments Given';
                                                                    } elseif ($promo['stage_status'] == 8) {
                                                                        echo 'Awaiting CV Update';
                                                                    } elseif ($promo['stage_status'] == 9) {
                                                                        echo 'Awaiting Papers Update';
                                                                    } elseif ($promo['stage_status'] == 10) {
                                                                        echo 'Awaiting Both CV & Papers Update';
                                                                    }
                                                                    ?>
                                                                <?php elseif ($promo['stage'] == 7) : ?>
                                                                    <?php
                                                                    if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                                        echo 'Approved & Promoted';
                                                                    } elseif ($promo['stage_status'] == 2) {
                                                                        echo 'Not Qualified';
                                                                    } elseif ($promo['stage_status'] == 3) {
                                                                        echo 'Review/Comments Given';
                                                                    } elseif ($promo['stage_status'] == 4) {
                                                                        echo 'Review/Comments Given';
                                                                    } elseif ($promo['stage_status'] == 8) {
                                                                        echo 'Awaiting CV Update';
                                                                    } elseif ($promo['stage_status'] == 9) {
                                                                        echo 'Awaiting Papers Update';
                                                                    } elseif ($promo['stage_status'] == 10) {
                                                                        echo 'Awaiting Both CV & Papers Update';
                                                                    }
                                                                    ?>
                                                                <?php endif; ?>
                                                                </b>
                                                        </strong>
                                                    </td>

                                                </tr>
                                        <?php }
                                        } ?>

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>