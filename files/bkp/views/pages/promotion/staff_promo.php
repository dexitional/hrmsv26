<?php 
include APPROOT.'/views/includes/nav.php';
?>
<section class="content">
    <div class="block-header">
        <div class="row">
            <div class="col-lg-7 col-md-6 col-sm-12">
                <h2>Staff Promotion List
                    
                <?php 
                    // var_dump($data['users'])
                    ?>
                <small class="text-muted">Welcome! You can view promotion status here</small>
                </h2>
            </div>
            <div class="col-lg-5 col-md-6 col-sm-12">
                <!-- <button class="btn btn-primary btn-icon btn-round hidden-sm-down float-right m-l-10" type="button">
                    <i class="zmdi zmdi-plus"></i>
                </button> -->
                <ul class="breadcrumb float-md-right">
                    <li class="breadcrumb-item"><a href="<?php echo URLROOT; ?>/pages/promo_apply"><i class="zmdi zmdi-home"></i> Main</a></li>
                    <li class="breadcrumb-item"><a href="javascript:void(0);">Staff</a></li>
                    <li class="breadcrumb-item active">All Promotion Application</li>
                </ul>
            </div>
        </div>
    </div>
    <div class="container-fluid">
        <div id="notice">

        </div>
        <div class="row clearfix">
            <div class="col-md-12">
                <div class="card patients-list">
                    <div class="body">
                        <div class="table-responsive">
                            <table class="table m-b-0 table-hover">
                                <thead>
                                    <tr>
                                        <th>Media</th>
                                        <th>Staff ID</th>
                                        <th>Name</th>
                                        <th>Position Applied</th>
                                        <th>Date Applied</th>
                                        <!-- <th>Stage</th> -->
                                        <th>Progress</th>
                                        <th>Status</th>
                                        <th>Documents</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach($data['users'] as $promo):?>                                    
                                    <tr>
                                        <td><span class="list-icon"><img class="patients-img" src="<?php echo URLROOT ?>/public/images/avatar3.png" alt=""></span></td>
                                        <td><span class="text-info"><?php echo $promo->staff_no; ?></span></td>
                                        <td><?php echo $promo->fname.' '.$promo->lname; ?></td>
                                        <td><?php echo $promo->title; ?></td>
                                        <td><?php echo $promo->activity_date; ?></td>
                                        <!-- <td><span class="badge badge-warning"><?php echo $promo->stage; ?></span></td> -->
                                        <td><div class="progress">
                                            <?php if($promo->promo_status == 1):?>
                                                <div class="progress-bar progress-bar-danger progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="5" aria-valuemin="0" aria-valuemax="100" style="width:5%"> 
                                                    <span class="sr-only">5% Complete</span> 
                                                </div>
                                            <?php elseif($promo->promo_status == 2):?>
                                                <div class="progress-bar progress-bar-warning progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width:20%"> 
                                                    <span class="sr-only">20% Complete</span> 
                                                </div>
                                            <?php elseif($promo->promo_status == 3):?>
                                                <div class="progress-bar progress-bar-info progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width:40%"> 
                                                    <span class="sr-only">40% Complete</span> 
                                                </div>
                                            <?php elseif($promo->promo_status == 4):?>
                                                <div class="progress-bar progress-bar-primary progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100" style="width:50%"> 
                                                    <span class="sr-only">50% Complete</span> 
                                                </div>
                                            <?php elseif($promo->promo_status == 5):?>
                                                <div class="progress-bar progress-bar-inverse progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100" style="width:70%"> 
                                                    <span class="sr-only">70% Complete</span> 
                                                </div>
                                            <?php elseif($promo->promo_status == 6):?>
                                                <div class="progress-bar progress-bar-warning progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="90" aria-valuemin="0" aria-valuemax="100" style="width:90%"> 
                                                    <span class="sr-only">90% Complete</span> 
                                                </div>
                                            <?php elseif($promo->promo_status == 7):?>
                                                <div class="progress-bar progress-bar-success progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%"> 
                                                    <span class="sr-only">100% Complete</span> 
                                                </div>
                                            <?php endif;?>
                                            </div>
                                        </td>
                                        <td>
                                        <?php if($promo->promo_status == 1):?>
                                            <a href="#" onclick="promo_status(<?php echo $promo->promotion_id;?>)" class="badge badge-info" title="View Status">
                                                <?php 
                                                if($promo->stage_status == 1)
                                                { echo 'With Head';} 
                                                elseif($promo->stage_status == 2)
                                                {echo 'Disapprove by Head';} 
                                                elseif($promo->stage_status == 0)
                                                {echo 'Pending With Head';} 
                                                ?>
                                                
                                            </a>
                                            <?php elseif($promo->promo_status == 2):?>
                                                <a href="#" onclick="promo_status(<?php echo $promo->promotion_id;?>)" class="badge badge-warning" title="View Status">
                                                <?php 
                                                if($promo->stage_status == 1)
                                                { echo 'With Dean';} 
                                                elseif($promo->stage_status == 2)
                                                {echo 'Disapprove by Dean';} 
                                                ?>
                                                    
                                                </a>
                                            <?php elseif($promo->promo_status == 3):?>
                                                <a href="#" onclick="promo_status(<?php echo $promo->promotion_id;?>)" class="badge badge-danger" title="View Status">
                                                <?php 
                                                if($promo->stage_status == 1)
                                                { echo 'With Provost';} 
                                                elseif($promo->stage_status == 2)
                                                {echo 'Disapprove by Provost';}
                                                elseif($promo->stage_status == 3)
                                                {echo 'Assigned To Assessor(s)';} 
                                                ?>
                                                    
                                                </a>
                                            <?php elseif($promo->promo_status == 4):?>
                                                <a href="#" onclick="promo_status(<?php echo $promo->promotion_id;?>)" class="badge badge-primary" title="View Status">
                                                <?php 
                                                if($promo->stage_status == 1)
                                                { echo 'Pending with HR';} 
                                                elseif($promo->stage_status == 2)
                                                {echo 'Disapprove by HR';} 
                                                elseif($promo->stage_status == 3)
                                                {echo 'Assigned to Assessor(s)';}
                                                ?>
                                                </a>
                                            <?php elseif($promo->promo_status == 5):?>
                                                <a href="#" onclick="promo_status(<?php echo $promo->promotion_id;?>)" class="badge badge-inverse" title="View Status">
                                                <?php 
                                                if($promo->stage_status == 1)
                                                { echo 'Assigned To Assessor(s)';} 
                                                elseif($promo->stage_status == 2)
                                                {echo 'Disapprove by HR';} 
                                                elseif($promo->stage_status == 3)
                                                {echo 'Assigned to Assessor(s)';}
                                                ?>
                                                </a>
                                            <?php elseif($promo->promo_status == 6):?>
                                                <a href="#" onclick="promo_status(<?php echo $promo->promotion_id;?>)" class="badge badge-warning" title="View Status">
                                                <?php 
                                                if($promo->stage_status == 1)
                                                { echo 'With HR';} 
                                                elseif($promo->stage_status == 2)
                                                {echo 'Disapprove by HR';} 
                                                elseif($promo->stage_status == 3)
                                                {echo 'Assigned to Assessor(s)';}
                                                ?>
                                                </a>
                                            <?php elseif($promo->promo_status == 7):?>
                                                <a href="#" onclick="promo_status(<?php echo $promo->promotion_id;?>)" class="badge badge-success" title="View Status">
                                                    <?php 
                                                    if($promo->stage_status == 1)
                                                    { echo 'Approved';} 
                                                    elseif($promo->stage_status == 2)
                                                    {echo 'Disapprove';} 
                                                    elseif($promo->stage_status == 3)
                                                    {echo 'Assigned to Assessor(s)';}
                                                    ?>
                                                </a>
                                            <?php endif;?>
                                    </td>
                                        <td>
                                        <a href="<?php echo URLROOT; ?>/pages/downloadfile1/<?php echo $promo->promotion_id;?>" class="btn btn-primary btn-sm btn-round" class="btn btn-primary btn-sm btn-round" title="<?php echo basename($promo->promo_doc1)?>">
                                            <i class="zmdi zmdi-download"></i>
                                        </a>
                                        <a href="<?php echo URLROOT; ?>/pages/downloadfile/<?php echo $promo->promotion_id;?>" class="btn btn-primary btn-sm btn-round" class="btn btn-primary btn-sm btn-round" title="<?php echo basename($promo->promo_doc2)?>">
                                            <i class="zmdi zmdi-download"></i>
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
    </div>
</section>

<?php 
include APPROOT."/views/includes/footer.php";
?>