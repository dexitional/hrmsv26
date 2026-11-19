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
<h5 class="theme-cutomizer-title red lighten-4 pt-2 pr-2 pl-2 pb-3 mt-10 circle-rounded white-text light-blue darken-4 box-shadow-none border-round center">Procurement Stages</h5>
<!-- <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css /> -->
<section class="gradient-custom-5">
    <div class="container py-5">
        <div class="main-timeline-5">
            <?php if (!empty($pos_sql)) {

                // var_dump($ps1);die();
                foreach ($pos_sql as $s_data) {
            ?>
                    <div class="timeline-5 right-5">
                        <div class="card">
                            <div class="card-body p-4">
                                <p>
                                    <b>
                                        <?php if ($_SESSION['user']['staff_type'] == 'NON-ACADEMIC') : ?>

                                            <?= (($s_data['stage'] == 1 && $s_data['stage_status'] == 1 && $s_data['status'] == 0) ? 'HOD Made Procurement Request' : (($s_data['stage'] == 2 && $s_data['stage_status'] == 1 && $s_data['status'] == 2) ? 'Director Approved' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 1 && $s_data['status'] == 2) ? 'Director Approved' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 1 && $s_data['status'] == 2) ? 'Procurement On Going' : (($s_data['stage'] == 2 && $s_data['stage_status'] == 2 && $s_data['status'] == 1) ? 'Director Disapproved' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 2 && $s_data['status'] == 2) ? 'Vice Chancellor Disapproved' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 1 && $s_data['status'] == 0) ? 'Director Made Procurement Request' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 1 && $s_data['status'] == 0) ? 'VC Made Procurement Request' : (($s_data['stage'] == 5 && $s_data['stage_status'] == 1 && $s_data['status'] == 5) ? 'Procurement On Going' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 3 && $s_data['status'] == 3) ? 'Awaiting Comment/Review' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 1 && $s_data['status'] == 4) ? 'Vice Chancellor Approve' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 4 && $s_data['status'] == 2) ? 'Comment/Review Given By ' . $s_data['staffname'] . ' of ' . $s_data['short_name'] : (($s_data['stage'] == 3 && $s_data['stage_status'] == 4 && $s_data['status'] == 4) ? 'Comment/Review Given By ' . $s_data['staffname'] . ' of ' . $s_data['short_name'] : (($s_data['stage'] == 4 && $s_data['stage_status'] == 5 && $s_data['status'] == 4) ? 'Grouping Done By Procurement - Officer Assigned: ' . $s_data['staff_assigned'] . ' - ' . $s_data['staff_assigned_phone'] : (($s_data['stage'] == 4 && $s_data['stage_status'] == 4 && $s_data['status'] == 6) ? 'Supplier Recommended - ' . $s_data['company_name'] : (($s_data['stage'] == 1 && $s_data['stage_status'] == 2 && $s_data['status'] == 2) ? 'Director Disapproved' : (($s_data['stage'] == 1 && $s_data['stage_status'] == 2 && $s_data['status'] == 3) ? 'Director Disapproved' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 2 && $s_data['status'] == 4) ? 'VC Disapproved' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 6 && $s_data['status'] == 4) ? 'Quotations Given' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 7 && $s_data['status'] == 4) ? 'Supplier Recommended - ' . $s_data['company_name'] : (($s_data['status'] == 9) ? 'Pricing Given By Procurement' : (($s_data['stage'] == 6 && $s_data['stage_status'] == 1 && $s_data['status'] == 4) ? 'Items Received At Stores' : (($s_data['stage'] == 2 && $s_data['stage_status'] == 2 && $s_data['status'] == 3) ? 'Registrar Disapproved' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 1 && $s_data['status'] == 3) ? 'Registrar Approved' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 8 && $s_data['status'] == 4) ? 'Comment From Procurement' : (($s_data['stage'] == 5 && $s_data['stage_status'] == 8 && $s_data['status'] == 4) ? 'Comment From Stores' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 11 && $s_data['status'] == 4) ? 'Assigned To Staff' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 1 && $s_data['status'] == 3) ? 'Vice Chancellor Approved' : '')))))))))))))))))))))))))))); ?>

                                        <?php elseif ($_SESSION['user']['staff_type'] == 'ACADEMIC') : ?>

                                            <?= (($s_data['stage'] == 1 && $s_data['stage_status'] == 1 &&
                                                $s_data['status'] == 1) ? 'HOD Made Procurement Request' : (($s_data['stage'] == 2 && $s_data['stage_status'] == 1
                                                && $s_data['status'] == 2) ? 'Dean Approved' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 1 &&
                                                $s_data['status'] == 3) ? 'Provost Approved' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 1 &&
                                                $s_data['status'] == 4) ? 'Vice Chancellor Approved' : (($s_data['stage'] == 5 && $s_data['stage_status'] == 1 &&
                                                $s_data['status'] == 5) ? 'Procurement On Going' : (($s_data['stage'] == 2
                                                && $s_data['stage_status'] == 2 && $s_data['status'] == 1) ? 'Dean Disapproved' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 2 && $s_data['status'] == 2) ? 'Provost Disapproved' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 2 && $s_data['status'] == 2) ? 'Vice Chancellor Disapproved' : (($s_data['stage'] == 1 && $s_data['stage_status'] == 1 && $s_data['status'] == 0) ? 'HOD Made Procurement Request' : (($s_data['stage'] == 2 && $s_data['stage_status'] == 1 && $s_data['status'] == 0) ? 'Dean Made Procurement Request' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 1 && $s_data['status'] == 0) ? 'Provost Made Procurement Request' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 1 && $s_data['status'] == 0) ? 'VC Made Procurement Request' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 1 && $s_data['status'] == 2) ? 'Dean Approved' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 1 && $s_data['status'] == 2) ? 'Dean Approved' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 1 && $s_data['status'] == 3) ? 'Provost Approved' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 1 && $s_data['status'] == 3) ? 'Provost Approved' : (($s_data['stage'] == 5 && $s_data['stage_status'] == 1 && $s_data['status'] == 4) ? 'Procurement In Progress' : (($s_data['stage'] == 2 && $s_data['stage_status'] == 1 && $s_data['status'] == 1) ? 'Dean Made Procurement Request' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 1 && $s_data['status'] == 1) ? 'Provost Made Procurement Request' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 1 && $s_data['status'] == 1) ? 'VC Made Procurement Request' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 3 && $s_data['status'] == 3) ? 'Awaiting Comment/Review' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 4 && $s_data['status'] == 3) ? 'Comment/Review Given By ' . $s_data['staffname'] . ' of ' . $s_data['short_name'] : (($s_data['stage'] == 3 && $s_data['stage_status'] == 4 && $s_data['status'] == 4) ? 'Comment/Review Given By ' . $s_data['staffname'] . ' of ' . $s_data['short_name'] : (($s_data['stage'] == 4 && $s_data['stage_status'] == 5 && $s_data['status'] == 4) ? 'Grouping Done By Procurement - Officer Assigned: ' . $s_data['staff_assigned'] . ' - ' . $s_data['staff_assigned_phone'] : (($s_data['stage'] == 4 && $s_data['stage_status'] == 4 && $s_data['status'] == 6) ? 'Supplier Recommended - ' . $s_data['company_name'] : (($s_data['stage'] == 1 && $s_data['stage_status'] == 2 && $s_data['status'] == 2) ? 'Dean Disapproved' : (($s_data['stage'] == 2 && $s_data['stage_status'] == 2 && $s_data['status'] == 3) ? 'Provost Disapproved' : (($s_data['stage'] == 3 && $s_data['stage_status'] == 2 && $s_data['status'] == 4) ? 'VC Disapproved' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 6 && $s_data['status'] == 4) ? 'Suppliers Quotations Given' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 7 && $s_data['status'] == 4) ? 'Supplier Recommended - ' . $s_data['company_name'] : (($s_data['status'] == 9) ? 'Pricing Given By Procurement' : (($s_data['stage'] == 6 && $s_data['stage_status'] == 1 && $s_data['status'] == 4) ? 'Items Received At Stores' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 8 && $s_data['status'] == 4) ? 'Comment From Procurement' : (($s_data['stage'] == 5 && $s_data['stage_status'] == 8 && $s_data['status'] == 4) ? 'Comment From Stores' : (($s_data['stage'] == 4 && $s_data['stage_status'] == 11 && $s_data['status'] == 4) ? 'Assigned To Staff' : ''))))))))))))))))))))))))))))))))))); ?>

                                        <?php endif; ?>
                                    </b>
                                </p>
                                <span class="small text-muted"><i class="fas fa-clock me-1"></i><?php echo $s_data['request_date']; ?></span>
                                <p class="mt-2 mb-0"><?php echo $s_data['comments']; ?> <br>
                                    <?php echo $s_data['item_description']; ?></p>
                            </div>
                        </div>
                    </div>
            <?php }
            } ?>
        </div>
    </div>

</section>