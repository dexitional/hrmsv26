<?php 
// include APPROOT.'/views/includes/nav.php';
// var_dump($data);
foreach($users as $user){

}
?>
<section>
    <div class="block-header">
        <div class="row">
            <div class="col-lg-7 col-md-6 col-sm-12">
                <h2>Staff List
                <small class="text-muted">Welcome to <?= strtolower($user['long_name']);?> staff list </small>
                </h2>
            </div>
        </div>
    </div>
    <div class="container-fluid">
        <!-- Basic Examples -->
        <div class="row clearfix">
            <div class="col-lg-12">
                <div class="card">
                    <div class="header">
                        <h2><strong><?= $user['long_name'];?></strong> </h2>
                        <ul class="header-dropdown">
                            <li class="dropdown"> <a href="javascript:void(0);" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"> <i class="zmdi zmdi-more"></i> </a>
                                <ul class="dropdown-menu dropdown-menu-right slideUp float-right">
                                    <li><a href="javascript:void(0);">Action</a></li>
                                    <li><a href="javascript:void(0);">Another action</a></li>
                                    <li><a href="javascript:void(0);">Something else</a></li>
                                </ul>
                            </li>
                            <li class="remove">
                                <a role="button" class="boxs-close"><i class="zmdi zmdi-close"></i></a>
                            </li>
                        </ul>
                    </div>
                    <div class="body">
                        <div class="body table-responsive">
                            <table class="table table-hover m-b-0 c_list js-basic-example dataTable">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Staff No.</th>
                                        <th>Job Title</th>
                                        <th>Phone No.</th>
                                        <th>Date Appointed</th>
                                        <th>Status</th>                                            
                                        <!-- <th>Discount</th> -->
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach($users as $s_data):?>
                                    <tr style="font-size: 12px;">
                                        <td>
                                            <img src="../../public/images/avatar3.png" width="25px;" class="rounded-circle avatar" alt="">
                                            <span class="c_name"><?= $s_data['title'].' '.$s_data['fname'].' '.$s_data['mname'].' '.$s_data['lname'];?></span>
                                        </td>
                                        <td><?= $s_data['staff_no'];?></td>
                                        <td><?= $s_data['jobtitle'];?></td>
                                        <td><?= $s_data['phone'];?></td>
                                        <td><?= $s_data['first_appoint_date'];?></td>
                                        <td>
                                            <p href="#" class="badge <?=((empty($s_data['app_self_status']))?'badge-danger':(($s_data['app_self_status'] == '1')?'badge-success':'badge-success'))?>" title="View Status"><?=((empty($s_data['app_self_status']))?'Not Submitted':(($s_data['app_self_status'] == '1')?'Appraisal Submitted':(($s_data['app_self_status'] == '3')?'Awaiting Completion':(($s_data['app_self_status'] == '4')?'Completed':'Submitted'))))?></p>
                                        </td>
                                        <!-- <td>10%</td> -->
                                        <td>
                                        <a href="appraisalform/<?= $s_data['staff_no'];?>" class="btn-info btn-icon btn-sm btn-icon-mini btn-round zmdi zmdi-edit" title="View/Edit Appraisal"></a>
                                        </td>
                                    </tr>
                                    <?php endforeach;?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>                
    </div>
</section>
