
<section class="">
    <div class="block-header">
        <div class="row">
            <div class="col-lg-7 col-md-6 col-sm-12">
                <h2>All contract staff renewal of your department
                <small class="text-muted">Welcome! You can act on contract renewal here</small>
                </h2>
            </div>
            <div class="col-lg-5 col-md-6 col-sm-12">
                <!-- <button class="btn btn-primary btn-icon btn-round hidden-sm-down float-right m-l-10" type="button">
                    <i class="zmdi zmdi-plus"></i>
                </button> -->
                <ul class="breadcrumb float-md-right">
                    <li class="breadcrumb-item"><a href="/pages/promo_apply"><i class="zmdi zmdi-home"></i> Main</a></li>
                    <li class="breadcrumb-item"><a href="javascript:void(0);">HOD</a></li>
                    <li class="breadcrumb-item active">All Contract Renewal Application
                    <?php //var_dump($data['positions'])?></li>
                </ul>
            </div>
        </div>
    </div>
    <div class="container-fluid">
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
                                        <th>Status</th>
                                        <th>Documents</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                <?php foreach($data['positions'] as $promo):?>                                    
                                    <tr>
                                        <td><span class="list-icon"><img class="patients-img" src="../../public/images/avatar3.png" alt=""></span></td>
                                        <td><span class="text-info"><?php echo $promo['staff_no']; ?></span></td>
                                        <td><?php echo $promo['fname'].' '.$promo['lname']; ?></td>
                                        <td><?php echo $promo['title']; ?></td>
                                        <td><?php echo $promo['activity_date']; ?></td>
                                        <td>
                                        <?php if($promo['promo_status'] == 1):?>
                                            <a href="#" onclick="promo_statusunit(<?php echo $promo['promotion_id'];?>)" class="badge badge-info" title="View Status">
                                                <?php 
                                                if($promo['stage_status'] == 1)
                                                { echo 'Awaiting your feedback';} 
                                                elseif($promo['stage_status'] == 2)
                                                {echo 'Disapprove by Head';} 
                                                elseif($promo['stage_status'] == 0)
                                                {echo 'Awaiting your feedback';} 
                                                ?>
                                                
                                            </a>
                                            <?php elseif($promo['promo_status'] == 2):?>
                                                <a href="#" onclick="promo_statusunit(<?php echo $promo['promotion_id'];?>)" class="badge badge-warning" title="View Status">
                                                <?php 
                                                if($promo['stage_status'] == 1)
                                                { echo 'Approved & forwarded to dean';} 
                                                elseif($promo['stage_status'] == 2)
                                                {echo 'Not qualified, Dean disapproved';} 
                                                ?>
                                                    
                                                </a>
                                            <?php elseif($promo['promo_status'] == 3):?>
                                                <a href="#" onclick="promo_statusunit(<?php echo $promo['promotion_id'];?>)" class="badge badge-danger" title="View Status">
                                                <?php 
                                                if($promo['stage_status'] == 1)
                                                { echo 'Approved & forwarded to Provost';} 
                                                elseif($promo['stage_status'] == 2)
                                                {echo 'Not qualified, Provost disapproved';}
                                                elseif($promo['stage_status'] == 3)
                                                {echo 'Assigned To Assessor(s)';} 
                                                ?>
                                                    
                                                </a>
                                            <?php elseif($promo['promo_status'] == 4):?>
                                                <a href="#" onclick="promo_statusunit(<?php echo $promo['promotion_id'];?>)" class="badge badge-primary" title="View Status">
                                                <?php 
                                                if($promo['stage_status'] == 1)
                                                { echo 'Approved & forwarded to HR';} 
                                                elseif($promo['stage_status'] == 2)
                                                {echo 'Not qualified, HR disapproved';} 
                                                elseif($promo['stage_status'] == 3)
                                                {echo 'Assigned to Assessor(s)';}
                                                ?>
                                                </a>
                                            <?php elseif($promo['promo_status'] == 5):?>
                                                <a href="#" onclick="promo_statusunit(<?php echo $promo['promotion_id'];?>)" class="badge badge-inverse" title="View Status">
                                                <?php 
                                                if($promo['stage_status'] == 1)
                                                { echo 'Assigned To Assessor(s)';} 
                                                elseif($promo['stage_status'] == 2)
                                                {echo 'Not qualified, HR disapproved';}
                                                elseif($promo['stage_status'] == 3)
                                                {echo 'Assigned to Assessor(s)';}
                                                ?>
                                                </a>
                                            <?php elseif($promo['promo_status'] == 6):?>
                                                <a href="#" onclick="promo_statusunit(<?php echo $promo['promotion_id'];?>)" class="badge badge-warning" title="View Status">
                                                <?php 
                                                if($promo['stage_status'] == 1)
                                                { echo 'Approved & forwarded to HR';} 
                                                elseif($promo['stage_status'] == 2)
                                                {echo 'Not qualified, HR disapproved';} 
                                                elseif($promo['stage_status'] == 3)
                                                {echo 'Assigned to Assessor(s)';}
                                                ?>
                                                </a>
                                            <?php elseif($promo['promo_status'] == 7):?>
                                                <a href="#" onclick="promo_statusunit(<?php echo $promo['promotion_id'];?>)" class="badge badge-success" title="View Status">
                                                    <?php 
                                                    if($promo['stage_status'] == 1)
                                                    { echo 'Approved & Accepted';} 
                                                    elseif($promo['stage_status'] == 2)
                                                    {echo 'Not Qualified';} 
                                                    elseif($promo['stage_status'] == 3)
                                                    {echo 'Assigned to Assessor(s)';}
                                                    ?>
                                                </a>
                                            <?php endif;?>
                                        </td>
                                        <td>
                                        <a href="downloadfile1/<?php echo $promo['promotion_id'];?>" class="btn btn-primary btn-sm btn-round" class="btn btn-primary btn-sm btn-round" title="<?php echo basename($promo['promo_doc1'])?>">
                                            <i class="zmdi zmdi-download"></i>
                                        </a>
                                        <a href="downloadfile/<?php echo $promo['promotion_id'];?>" class="btn btn-primary btn-sm btn-round" class="btn btn-primary btn-sm btn-round" title="<?php echo basename($promo['promo_doc2'])?>">
                                            <i class="zmdi zmdi-download"></i>
                                        </a>
                                        </td>
                                        <td class="text-center">
                                        <?php if($promo['stage_status'] == 2):?>
                                            <a href="javascript:void(0);" disabled class="btn btn-primary btn-round" 
                                            data-toggle="modal" data-original-title="Edit application form" data-target="#approve" title="Edit application form" data-id="<?php echo $promo['promotion_id'];?>" data-entry="7">
                                                <i class="zmdi zmdi-edit"></i>
                                            </a>
                                        <?php elseif($promo['stage_status'] == 1 || $promo['stage_status'] == 3):?>
                                            <a href="javascript:void(0);" <?= (($promo['promo_status'] > 1)? 'disabled':'')?> class="btn btn-primary btn-round" 
                                            data-toggle="modal" data-original-title="Edit application form" data-target="#approve" title="Edit application form"
                                             data-id="<?php echo $promo['promotion_id'];?>" data-entry="2,1">
                                                <i class="zmdi zmdi-edit"></i>
                                            </a>
                                        <?php elseif($promo['stage_status'] == 0):?>
                                            <a href="javascript:void(0);" class="btn btn-primary btn-round" data-toggle="modal" data-original-title="Edit application form" 
                                            data-target="#approve" title="Edit application form" data-id="<?php echo $promo['promotion_id'];?>" data-entry="2,1">
                                                <i class="zmdi zmdi-edit"></i>
                                            </a>
                                        <?php endif;?>
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


<div class="modal fade right" id="approve" tabindex="-1" role="dialog" aria-labelledby="approval_modalTitle" style="width:500px; height:auto;" aria-hidden="true">
  <div class="modal-dialog modal-dialog-scrollable" role="document">
    <div class="modal-content" style="border-radius: 10px 10px;">
      <div class="modal-header bg-primary">
        <h5 class="modal-title text-white">Approve/Disapprove</h5>
        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body bg-light">
    <form method="POST" class="uploadfileapproval">
        <input type="hidden" name="promo_id" id="promo_id">
        <input type="hidden" name="promo_stage" id="promo_stage">
        <input type="hidden" name="apply_type" id="apply_type" value='1'>
        <div class="clearfix">
        <div class="funkyradio row">
            <div class="funkyradio-primary col-md-6 col-lg-6 col-sm-6">
                <input type="radio" name="radio" class="radio" id="radio1" value="1" />
                <label for="radio1">Approve</label>
            </div>
            <div class="funkyradio-primary col-md-6 col-lg-6 col-sm-6">
                <input type="radio" name="radio" class="radio" id="radio2" value="2"/>
                <label for="radio2">Disapprove</label>
            </div>
        </div>
            <div class="col-lg-12 col-md-12">
                <div class="form-group">
                    <label for="comment"><strong>Comments</strong></label>
                    <textarea name="comment" id="comment" rows="2" class="form-control" placeholder="Type a comment here..."></textarea>
                </div>
            </div>
            <div class="col-lg-12 col-md-12 mb-4">
                <label for="input-folder-3 mt-3"><strong>Upload Confidential Report</strong></label><br>
                <small class="text-danger">File should be in <strong>pdf/image</strong> format</small>
                <div class="file-loading">
                    <input id="input-folder-3" name="input-folder-3[]" type="file">
                </div>
            </div>
        </div>
        <div class="row mb-4">
        <div class="col-md-6 col-lg-6 col-sm-6 mx-auto">
            <button class="btn btn-primary btn-round btn-block mx-auto" type="submit" name="approve" id="approve">
            Submit</button>
        </div>
        <div class="col-md-6 col-lg-6 col-sm-6 mx-auto">
            <button class="btn btn-primary btn-round btn-block mx-auto" type="button" data-dismiss="modal" aria-label="Close">
            Cancel</button>
        </div>
      </div>
      </div>
      
      </form>
    </div>
  </div>
</div>

<!-- <script>
    // $("#approve").on('show.bs.modal', function(event){
    //     var button = $(event.relatedTarget);
    //     var promo_id = button.data('id');
    //     var promo_stage = button.data('entry');

    //     var modal = $(this);
    //     modal.find('.modal-body #promo_id').val(promo_id);
    //     modal.find('.modal-body #promo_stage').val(promo_stage);
    // })
</script> -->
