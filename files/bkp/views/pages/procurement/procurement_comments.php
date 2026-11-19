<?php $headtype = isset($_SESSION['headtype']) ? $_SESSION['headtype'] : (isset($_SESSION['user']['type']) ? $_SESSION['user']['type'] : ''); ?>
<style>
#comment {border-style: solid;
  border-color: #d5d5d5;}
#comment:hover {background-color: #d5d5d5;}
</style>
<section class="">
    <div class="block-header">
        <div class="row">
            <div class="col-lg-7 col-md-6 col-sm-12">
                <h2>Procurement Rewiew
                <small class="text-muted">Welcome! You can act on procurement review here
                
                </small>
                </h2>
            </div>
            <div class="col-lg-5 col-md-6 col-sm-12">
                <!-- <button class="btn btn-primary btn-icon btn-round hidden-sm-down float-right m-l-10" type="button">
                    <i class="zmdi zmdi-plus"></i>
                </button> -->
                <ul class="breadcrumb float-md-right">
                    <li class="breadcrumb-item"><a href="/pages/promo_apply"><i class="zmdi zmdi-home"></i> Main</a></li>
                    <li class="breadcrumb-item"><a href="javascript:void(0);">Reviews</a></li>
                    <li class="breadcrumb-item active">All Procurement Reviews
                    <?php //echo $_SESSION['user']['staff_no']?></li>
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
                                        <th>Date Submitted</th>
                                        <!-- <th>Media</th> -->
                                        <!-- <th>Staff ID</th> -->
                                        <!-- <th>Requester</th> -->
                                        <th>Sent From</th>
                                        <th>Sent To</th>
                                        <th>Total Amount</th>
                                        <th>Status</th>
                                        <th>Progress</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                <?php foreach($data['positions'] as $promo):?>                                    
                                    <tr>
                                        <td><span class="text-info"><?php echo $promo['activity_time']; ?></span></td>
                                        <!-- <td><span class="list-icon"><img class="patients-img" src="../../public/images/avatar3.png" alt=""></span></td> -->
                                        <!-- <td><span class="text-info"><?php echo $promo['staff_no']; ?></span></td> -->
                                        <!-- <td><?php echo $promo['fname'].' '.$promo['lname']; ?></td> -->
                                        <td><span class="text-info"><?php echo $promo['stage'] == '3'? 'VC\'s Office':'Procurement Office'; ?></span></td>
                                        <td><span class="text-info"><?php echo $promo['short_name']; ?></span></td>
                                        <td><span class="text-info"><?php echo $promo['total_price']; ?></span></td>
                                        <td>
                                        <?php if($promo['stage'] == 1):?>

                                                <a href="#" class="badge badge-warning">
                                                <?php 
                                                if($promo['stage_status'] == 1 || $promo['stage_status'] == 0)
                                                { echo (($headtype == 'ACADEMIC')?'Awaiting Your Responds':'Awaiting Your Responds');} 
                                                elseif($promo['stage_status'] == 2)
                                                {echo (($headtype == 'ACADEMIC')?'Not qualified, Dean disapproved':'Not qualified, Director disapproved');} 
                                                elseif($promo['stage_status'] == 8)
                                                {echo 'Awaiting CV Update';} 
                                                elseif($promo['stage_status'] == 9)
                                                {echo 'Awaiting Papers Update';}
                                                elseif($promo['stage_status'] == 10)
                                                {echo 'Awaiting Both CV & Papers Update';} 
                                                ?>
                                                    
                                                </a>
                                            <?php elseif($promo['stage'] == 2):?>
                                                <a href="#" class="badge badge-danger">
                                                <?php 
                                                if($promo['stage_status'] == 1 || $promo['stage_status'] == 0)
                                                { echo (($headtype == 'ACADEMIC')?'Approved & forwarded to Provost':'Approved & forwarded to Registrar');} 
                                                elseif($promo['stage_status'] == 2)
                                                {echo (($headtype == 'ACADEMIC')?'Not qualified, Provost disapproved':'Not qualified, Registrar disapproved');}
                                                elseif($promo['stage_status'] == 3)
                                                {echo 'Assigned To Assessor(s)';} 
                                                elseif($promo['stage_status'] == 8)
                                                {echo 'Awaiting CV Update';} 
                                                elseif($promo['stage_status'] == 9)
                                                {echo 'Awaiting Papers Update';}
                                                elseif($promo['stage_status'] == 10)
                                                {echo 'Awaiting Both CV & Papers Update';} 
                                                ?>
                                                    
                                                </a>
                                            <?php elseif($promo['stage'] == 3):?>
                                                <a href="#" class="badge badge-primary">
                                                <?php 
                                                if($promo['stage_status'] == 1 || $promo['stage_status'] == 0)
                                                { echo 'Approved & forwarded to VC';} 
                                                elseif($promo['stage_status'] == 2)
                                                {echo 'Not qualified, HR disapproved';} 
                                                elseif($promo['stage_status'] == 3)
                                                {echo 'Awaiting Your Review/Comments';}
                                                elseif($promo['stage_status'] == 8)
                                                {echo 'Assigned to Assessor(s)';}
                                                elseif($promo['stage_status'] == 8)
                                                {echo 'Awaiting CV Update';} 
                                                elseif($promo['stage_status'] == 9)
                                                {echo 'Awaiting Papers Update';}
                                                elseif($promo['stage_status'] == 10)
                                                {echo 'Awaiting Both CV & Papers Update';} 
                                                ?>
                                                </a>
                                            <?php elseif($promo['stage'] == 4):?>
                                                <a href="#" class="badge badge-primary">
                                                <?php 
                                                if($promo['stage_status'] == 1 || $promo['stage_status'] == 0)
                                                { echo 'Approved & forwarded to Procurement Office';} 
                                                elseif($promo['stage_status'] == 2)
                                                {echo 'Not qualified, HR disapproved';} 
                                                elseif($promo['stage_status'] == 3)
                                                {echo 'Assigned to Assessor(s)';}
                                                elseif($promo['stage_status'] == 8)
                                                {echo 'Assigned to Assessor(s)';}
                                                elseif($promo['stage_status'] == 8)
                                                {echo 'Awaiting CV Update';} 
                                                elseif($promo['stage_status'] == 9)
                                                {echo 'Awaiting Papers Update';}
                                                elseif($promo['stage_status'] == 10)
                                                {echo 'Awaiting Both CV & Papers Update';} 
                                                ?>
                                                </a>
                                            <?php elseif($promo['stage'] == 5):?>
                                                <a href="#" class="badge badge-inverse">
                                                <?php 
                                                if($promo['stage_status'] == 1 || $promo['stage_status'] == 0)
                                                { echo 'Assigned To Assessor(s)';} 
                                                elseif($promo['stage_status'] == 2)
                                                {echo 'Not qualified, HR disapproved';}
                                                elseif($promo['stage_status'] == 3)
                                                {echo 'Assigned to Assessor(s)';}
                                                elseif($promo['stage_status'] == 8)
                                                {echo 'Awaiting CV Update';} 
                                                elseif($promo['stage_status'] == 9)
                                                {echo 'Awaiting Papers Update';}
                                                elseif($promo['stage_status'] == 10)
                                                {echo 'Awaiting Both CV & Papers Update';} 
                                                ?>
                                                </a>
                                            <?php elseif($promo['stage'] == 6):?>
                                                <a href="#" class="badge badge-warning" >
                                                <?php 
                                                if($promo['stage_status'] == 1 || $promo['stage_status'] == 0)
                                                { echo 'Approved & forwarded to HR';} 
                                                elseif($promo['stage_status'] == 2)
                                                {echo 'Not qualified, HR disapproved';} 
                                                elseif($promo['stage_status'] == 3)
                                                {echo 'Assigned to Assessor(s)';}
                                                elseif($promo['stage_status'] == 8)
                                                {echo 'Awaiting CV Update';} 
                                                elseif($promo['stage_status'] == 9)
                                                {echo 'Awaiting Papers Update';}
                                                elseif($promo['stage_status'] == 10)
                                                {echo 'Awaiting Both CV & Papers Update';} 
                                                ?>
                                                </a>
                                            <?php elseif($promo['stage'] == 7):?>
                                                <a href="#" class="badge badge-success">
                                                    <?php 
                                                    if($promo['stage_status'] == 1 || $promo['stage_status'] == 0)
                                                    { echo 'Approved & Promoted';} 
                                                    elseif($promo['stage_status'] == 2)
                                                    {echo 'Not Qualified';} 
                                                    elseif($promo['stage_status'] == 3)
                                                    {echo 'Assigned to Assessor(s)';}
                                                    elseif($promo['stage_status'] == 8)
                                                    {echo 'Awaiting CV Update';} 
                                                    elseif($promo['stage_status'] == 9)
                                                    {echo 'Awaiting Papers Update';}
                                                    elseif($promo['stage_status'] == 10)
                                                    {echo 'Awaiting Both CV & Papers Update';} 
                                                    ?>
                                                </a>
                                            <?php endif;?>
                                        </td>
                                        <td>
                                        <a href="#" onclick="procure_statusunit(<?php echo $promo['request_id'];?>)" class="badge badge-info" title="View Progress">
                                                    <i class="zmdi zmdi-eye" style="font-size:30px"></i>
                                                </a>
                                        </td>
                                        <td>
                                        <?php if($promo['stage_status'] == 2):?>
                                            <a href="javascript:void(0);" disabled class="btn btn-primary btn-round" 
                                            data-toggle="modal" data-original-title="Enter Comments/Review" data-target="#approve" title="Take Action" 
                                            data-id="<?php echo $promo['request_id'];?>" data-entry="7">
                                                <i class="zmdi zmdi-edit"></i>
                                            </a>
                                        <?php elseif($promo['stage_status'] == 1 || $promo['stage_status'] == 3):?>
                                            <a href="javascript:void(0);" <?= (($promo['stage'] > 1)? '':'')?> class="btn btn-info btn-round" onclick="procuremodal_view(<?php echo $promo['request_id'];?>)" title="View/Edit Procurement Form" data-id="<?php echo $promo['request_id'];?>" data-entry="$promo['stage'].',1,'.$promo['status']?>">
                                                <i class="zmdi zmdi-edit"></i>
                                            </a>
                                            <a href="javascript:void(0);" <?= (($promo['stage'] > 1)? '':'')?> class="btn btn-primary btn-round" 
                                            data-toggle="modal" data-original-title="Enter Comments/Review" data-target="#approve" title="Take Action"
                                             data-id="<?php echo $promo['request_id'];?>" data-entry="<?=$promo['stage'].',1,'.$promo['status']?>">
                                                <i class="zmdi zmdi-thumb-up"></i>
                                            </a>                                            
                                        <?php elseif($promo['stage_status'] == 0 && $promo['stage'] == 1):?>
                                            <a href="javascript:void(0);" <?= (($promo['stage'] > 1)? '':'')?> class="btn btn-info btn-round" onclick="procuremodal_view(<?php echo $promo['request_id'];?>)" title="View/Edit Procurement Form" data-id="<?php echo $promo['request_id'];?>" data-entry="<?=$promo['stage'].','.$promo['stage_status'].','.$promo['status'];?>">
                                                <i class="zmdi zmdi-edit"></i>
                                            </a>
                                            <a href="javascript:void(0);" class="btn btn-primary btn-round" data-toggle="modal" data-original-title="Take Action" 
                                            data-target="#approve" title="Enter Comments/Review" data-id="<?php echo $promo['request_id'];?>" data-entry="<?=$promo['stage'].',1,'.$promo['status'];?>">
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


<div class="modal fade right" id="approve" tabindex="-1" role="dialog" style="width:50%; height:auto;" aria-labelledby="approval_modalTitle" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-scrollable" role="document">
    <div class="modal-content" style="border-radius: 10px 10px;">
      <div class="modal-header bg-primary">
        <h5 class="modal-title text-white">Comments/Review Form</h5>
        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true"class="text-white btn-sm btn-danger">Close</span>
        </button>
      </div>
      <div class="modal-body bg-light">
    <form method="POST" class="procurecomments">
        <input type="hidden" name="promo_id" id="promo_id">
        <input type="hidden" name="promo_stage" id="promo_stage">
        <input type="hidden" name="apply_type" id="apply_type" value='0'>
        <div class="clearfix">
        <!-- <div class="funkyradio row">
            <div class="funkyradio-primary col-md-6 col-lg-6 col-sm-6">
                <input type="radio" name="radio" class="radio" id="radio1" value="1" />
                <label for="radio1" class="text-dark font-weight-bold" style="font-size:15px;">Approve</label>
            </div>
            <div class="funkyradio-primary col-md-6 col-lg-6 col-sm-6">
                <input type="radio" name="radio" class="radio" id="radio2" value="2"/>
                <label for="radio2" class="text-dark font-weight-bold" style="font-size:15px;">Disapprove</label>
            </div>
        </div> -->
            <div class="col-lg-12 col-md-12 mb-4">
                <div class="form-group">
                    <label for="comment" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Enter Your Comment/Review</strong></label>
                    <textarea name="comment" id="comment" rows="6" class="form-control" placeholder="Type a comment/review here..."></textarea>
                </div>
            </div>
        </div>
        <div class="row mb-4">
        <div class="col-md-6 col-lg-6 col-sm-6 mx-auto">
            <button class="btn btn-block font-weight-bold gradient-shadow gradient-45deg-indigo-blue box-shadow-none btn-round" type="submit" name="approve" id="approve">
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