<?php $headtype = isset($_SESSION['headtype']) ? $_SESSION['headtype'] : (isset($_SESSION['user']['type']) ? $_SESSION['user']['type'] : ''); ?>
<style>
#comment {border-style: solid;
  border-color: #d5d5d5;}
#comment:hover {background-color: #d5d5d5;}
</style>
<section>
    <div class="block-header">
        <div class="row">
            <div class="col-lg-7 col-md-6 col-sm-12">
            <h2>Promotion List, <?=(($headtype == 'ACADEMIC')?'PROVOST':'REGISTRAR')?>'S Office
                <small class="text-muted">Welcome! You can act on promotions here</small>
                </h2>
            </div>
            <div class="col-lg-5 col-md-6 col-sm-12">
                <button class="btn btn-primary btn-round float-right m-l-10"  data-toggle="modal" data-target="#add_assessor" type="button">
                    <i class="zmdi zmdi-plus"></i>
                    Add Assessor
                </button>
                <ul class="breadcrumb float-md-right">
                    <li class="breadcrumb-item"><a href="promo_apply"><i class="zmdi zmdi-home"></i> Main</a></li>
                    <li class="breadcrumb-item"><a href="javascript:void(0);"><?=(($headtype == 'ACADEMIC')?'PROVOST':'REGISTRAR')?></a></li>
                    <li class="breadcrumb-item active">All Promotion List</li>
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
                                        <th>Assessor</th>
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
                                            <a href="#" class="badge badge-info">
                                                <?php 
                                                if($promo['stage_status'] == 1 || $promo['stage_status'] == 0)
                                                { echo (($_SESSION['user']['type'] == 'ACADEMIC')?'Received by HoD':'Received by HoD');} 
                                                elseif($promo['stage_status'] == 2)
                                                {echo 'Not qualified, HoD disapproved';} 
                                                elseif($promo['stage_status'] == 0)
                                                {echo 'Received by HoD';} 
                                                elseif($promo['stage_status'] == 8)
                                                {echo 'Awaiting CV Update';} 
                                                elseif($promo['stage_status'] == 11)
                                                {echo 'Awaiting Application Form Update';} 
                                                elseif($promo['stage_status'] == 9)
                                                {echo 'Awaiting Papers Update';}
                                                elseif($promo['stage_status'] == 10)
                                                {echo 'Awaiting Both CV, Application Form & Papers Update';}
                                                ?>
                                                
                                            </a>
                                            <?php elseif($promo['promo_status'] == 2):?>
                                                <a href="#" class="badge badge-warning">
                                                <?php 
                                                if($promo['stage_status'] == 1 || $promo['stage_status'] == 0)
                                                { echo (($_SESSION['user']['type'] == 'ACADEMIC')?'Approved & forwarded to Dean':'Approved & forwarded to Director');} 
                                                elseif($promo['stage_status'] == 2)
                                                {echo (($_SESSION['user']['type'] == 'ACADEMIC')?'Not qualified, Dean disapproved':'Not qualified, Director disapproved');} 
                                                elseif($promo['stage_status'] == 8)
                                                {echo 'Awaiting CV Update';} 
                                                elseif($promo['stage_status'] == 11)
                                                {echo 'Awaiting Application Form Update';} 
                                                elseif($promo['stage_status'] == 9)
                                                {echo 'Awaiting Papers Update';}
                                                elseif($promo['stage_status'] == 10)
                                                {echo 'Awaiting Both CV, Application Form & Papers Update';}
                                                ?>
                                                    
                                                </a>
                                            <?php elseif($promo['promo_status'] == 3):?>
                                                <a href="#" class="badge badge-danger">
                                                <?php 
                                                if($promo['stage_status'] == 1 || $promo['stage_status'] == 0)
                                                { echo 'Awaiting your feedback';} 
                                                elseif($promo['stage_status'] == 2)
                                                {echo (($_SESSION['user']['type'] == 'ACADEMIC')?'Disapprove by Provost':'Disapprove by Registrar');} 
                                                elseif($promo['stage_status'] == 3)
                                                {echo 'Assigned To Assessor(s)';} 
                                                elseif($promo['stage_status'] == 8)
                                                {echo 'Awaiting CV Update';} 
                                                elseif($promo['stage_status'] == 11)
                                                {echo 'Awaiting Application Form Update';} 
                                                elseif($promo['stage_status'] == 9)
                                                {echo 'Awaiting Papers Update';}
                                                elseif($promo['stage_status'] == 10)
                                                {echo 'Awaiting Both CV, Application Form & Papers Update';}
                                                ?>
                                                    
                                                </a>
                                            <?php elseif($promo['promo_status'] == 4):?>
                                                <a href="#" class="badge badge-primary">
                                                <?php 
                                                if($promo['stage_status'] == 1 || $promo['stage_status'] == 0)
                                                { echo 'Approved & forwarded to HR';} 
                                                elseif($promo['stage_status'] == 2)
                                                {echo 'Not qualified, HR disapproved';} 
                                                elseif($promo['stage_status'] == 3)
                                                {echo 'Assigned to Assessor(s)';}
                                                elseif($promo['stage_status'] == 8)
                                                {echo 'Awaiting CV Update';} 
                                                elseif($promo['stage_status'] == 11)
                                                {echo 'Awaiting Application Form Update';} 
                                                elseif($promo['stage_status'] == 9)
                                                {echo 'Awaiting Papers Update';}
                                                elseif($promo['stage_status'] == 10)
                                                {echo 'Awaiting Both CV, Application Form & Papers Update';}
                                                ?>
                                                </a>
                                            <?php elseif($promo['promo_status'] == 5):?>
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
                                                elseif($promo['stage_status'] == 11)
                                                {echo 'Awaiting Application Form Update';} 
                                                elseif($promo['stage_status'] == 9)
                                                {echo 'Awaiting Papers Update';}
                                                elseif($promo['stage_status'] == 10)
                                                {echo 'Awaiting Both CV, Application Form & Papers Update';}
                                                ?>
                                                </a>
                                            <?php elseif($promo['promo_status'] == 6):?>
                                                <a href="#" class="badge badge-warning">
                                                <?php 
                                                if($promo['stage_status'] == 1 || $promo['stage_status'] == 0)
                                                { echo 'Approved & forwarded to HR';} 
                                                elseif($promo['stage_status'] == 2)
                                                {echo 'Not qualified, HR disapproved';} 
                                                elseif($promo['stage_status'] == 3)
                                                {echo 'Assigned to Assessor(s)';}
                                                elseif($promo['stage_status'] == 8)
                                                {echo 'Awaiting CV Update';} 
                                                elseif($promo['stage_status'] == 11)
                                                {echo 'Awaiting Application Form Update';} 
                                                elseif($promo['stage_status'] == 9)
                                                {echo 'Awaiting Papers Update';}
                                                elseif($promo['stage_status'] == 10)
                                                {echo 'Awaiting Both CV, Application Form & Papers Update';}
                                                ?>
                                                </a>
                                            <?php elseif($promo['promo_status'] == 7):?>
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
                                                    elseif($promo['stage_status'] == 11)
                                                    {echo 'Awaiting Application Form Update';} 
                                                    elseif($promo['stage_status'] == 9)
                                                    {echo 'Awaiting Papers Update';}
                                                    elseif($promo['stage_status'] == 10)
                                                    {echo 'Awaiting Both CV, Application Form & Papers Update';}
                                                    ?>
                                                </a>
                                            <?php endif;?>
                                        </td>
                                        <td>
                                        <a href="#" onclick="promo_statusprovost(<?php echo $promo['promotion_id'];?>)" class="badge badge-info" title="View & Download Documents">
                                                    <i class="zmdi zmdi-download" style="font-size:30px"></i>
                                                </a>
                                        </td>
                                        <td>
                                        <button class="btn btn-primary btn-round" onclick="assessor(<?php echo $promo['promotion_id'];?>)">
                                        Assign Assessor
                                        </button>
                                        </td>
                                        <td class="text-center">
                                        <?php if($promo['stage_status'] == 2):?>
                                            <a href="javascript:void(0);" disabled class="btn btn-primary btn-round" 
                                            data-toggle="modal" data-original-title="Take Action" data-target="#approve" 
                                            title="Take Action" data-id="<?php echo $promo['promotion_id'];?>" data-entry="7">
                                                <i class="zmdi zmdi-edit"></i>
                                            </a>
                                        <?php elseif($promo['stage_status'] == 1 || $promo['stage_status'] == 3):?>
                                            <a href="javascript:void(0);" <?= (($promo['promo_status'] > 3)? 'disabled':'')?> 
                                            class="btn btn-info btn-round" data-toggle="modal" data-original-title="Take Action" 
                                            data-target="#return" title="Return form to applicant" 
                                            data-id="<?php echo $promo['promotion_id'];?>" data-entry="3">
                                                <i class="zmdi zmdi-undo"></i>
                                            </a>
                                            <a href="javascript:void(0);" <?= (($promo['promo_status'] > 3)? 'disabled':'')?> 
                                            class="btn btn-primary btn-round" data-toggle="modal" data-original-title="Take Action" 
                                            data-target="#approve" title="Approve/Disapprove" data-id="<?php echo $promo['promotion_id'];?>" 
                                            data-entry="4,3">
                                                <i class="zmdi zmdi-edit"></i>
                                            </a>
                                        <?php elseif($promo['stage_status'] == 0 && $promo['promo_status'] == 3):?>
                                            <a href="javascript:void(0);" class="btn btn-info btn-round" data-toggle="modal" 
                                            data-original-title="Take Action" 
                                            data-target="#return" title="Return form to applicant" 
                                            data-id="<?php echo $promo['promotion_id'];?>" data-entry="3">
                                                <i class="zmdi zmdi-undo"></i>
                                            </a>
                                            <a href="javascript:void(0);" class="btn btn-primary btn-round" data-toggle="modal" 
                                            data-original-title="Take Action" data-target="#approve" title="Approve/Disapprove" 
                                            data-id="<?php echo $promo['promotion_id'];?>" data-entry="7">
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

<div class="modal fade right" id="add_assessor" tabindex="-1" style="width:50%; height:100%;" role="dialog" aria-labelledby="myModalLabel"
   aria-hidden="true">
   <div class="modal-dialog modal-xl modal-dialog-scrollable" role="document">
     <div class="modal-content" style="border-radius: 10px 10px;">
       <div class="modal-header bg-primary">
         <h5 class="text-white">Add Assessor </h5>
         <button type="button" class="close" data-dismiss="modal" aria-label="Close">
           <span aria-hidden="true" class="text-white btn-sm btn-danger">Close</span>
         </button>
       </div>
       <div class="modal-body bg-light">
         <form method="POST" id="addaccessor" class="bg-light addaccessor">
         <div class="body bg-light">
            <div class="row clearfix">
                <div class="col-lg-6 col-md-12">
                    <div class="form-group">
                        <label for="fname" class="text-dark font-weight-bold" style="font-size:15px;">First Name</label>
                        <input required type="text" name="fname" id="fname" class="form-control show-tick" placeholder="First Name">
                    </div>
                </div>
                <div class="col-lg-6 col-md-12">
                    <div class="form-group">
                        <label for="lname" class="text-dark font-weight-bold" style="font-size:15px;">Last Name</label>
                        <input required type="text" name="lname" id="lname" class="form-control show-tick" placeholder="Last Name">
                    </div>
                </div>                                    
                <div class="col-lg-6 col-md-12">
                    <div class="form-group">
                        <label for="phone_no" class="text-dark font-weight-bold" style="font-size:15px;">Phone Number</label>
                        <input required type="number" name="phone_no" id="phone_no" class="form-control show-tick" placeholder="Phone Number">
                    </div>
                </div>
                
                <div class="col-lg-6 col-md-12">
                    <div class="form-group">
                        <label for="email" class="text-dark font-weight-bold" style="font-size:15px;">Email</label>
                        <input required type="email" name="email" id="email" class="form-control show-tick" placeholder="E-mail">
                    </div>
                </div>
                <div class="col-lg-6 col-md-12">
                    <div class="form-group">
                        <label for="country" class="text-dark font-weight-bold" style="font-size:15px;">Country</label>
                        <input required type="text" name="country" id="country" class="form-control show-tick" placeholder="Country">
                    </div>
                </div>
                <div class="col-lg-6 col-md-12">
                    <div class="form-group">
                        <label for="city" class="text-dark font-weight-bold" style="font-size:15px;">City</label>
                        <input required type="text" name="city" id="city" class="form-control show-tick" placeholder="City">
                    </div>
                </div>
                <div class="col-md-12 mb-2">
                    <div class="form-group">
                        <label for="address" class="text-dark font-weight-bold" style="font-size:15px;">Address</label>
                        <textarea rows="2" name="address" id="address" class="form-control no-resize" placeholder="Address Line 1"></textarea>
                    </div>
                </div>
                <!-- <hr> -->
                <div class="col-lg-12 col-md-12">
                    <div class="form-group">
                        <label for="edu_level" class="text-dark font-weight-bold" style="font-size:15px;">Assessors Rank</label>
                        <select required class="d-block" style="width:100%;" name="edu_level" id="edu_level">
                            <option value="">- Educational Level -</option>
                            <option value="Bachelors">Bachelors</option>
                            <option value="Masters">Masters</option>
                            <option value="Doctorate">Doctorate</option>
                            <option value="Professorship">Professorship</option>
                        </select>
                    </div>
                </div>
                <div class="col-lg-12 col-md-12">
                    <div class="form-group">
                        <label for="curr_institute" class="text-dark font-weight-bold" style="font-size:15px;">Current Institution</label>
                        <select required class="d-block" style="width:100%;" name="curr_institute" id="curr_institute">
                            <option value="">- Current Institute -</option>
                            <option value="University of Ghana">University of Ghana</option>
                            <option value="University of Cape Coast">University of Cape Coast</option>
                            <option value="University of Education">University of Education</option>
                            <option value="University for Development Studies">University for Development Studies</option>
                            <option value="University of Health andallied Sciences">University of Health and allied Sciences</option>
                        </select>
                    </div>
                </div>
                <div class="col-lg-12 col-md-12">
                    <div class="form-group">
                        <label for="area_special" class="text-dark font-weight-bold" style="font-size:15px;">Area of Speciality</label>
                        <select required class="d-block" style="width:100%;" name="area_special" id="area_special">
                            <option value="">- Area of Speciality -</option>
                            <option value="ART & DESIGN">ART & DESIGN</option>
                            <option value="BUSINESS & MANAGEMENT">BUSINESS & MANAGEMENT</option>
                            <option value="COMPUTER & TECHNOLOGY">COMPUTER & TECHNOLOGY</option>
                            <option value="CRIMINAL JUSTICE & LEGAL">CRIMINAL JUSTICE & LEGAL</option>
                            <option value="EDUCATION & TEACHING">EDUCATION & TEACHING</option>
                            <option value="LIBERAL ART & HUMANITIES">LIBERAL ART & HUMANITIES</option>
                            <option value="NURSING & HEALTHCARE">NURSING & HEALTHCARE</option>
                            <option value="PSYCHOLOGY & COUNSELING">PSYCHOLOGY & COUNSELING</option>
                            <option value="SCIENCE & ENGINEERING">SCIENCE & ENGINEERING</option>
                            <option value="TRADES & CAREERS">TRADES & CAREERS</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-12 mb-5">
            <button class="btn btn-primary btn-round btn-block" type="submit" name="submit" id="submit">Add Assessor</button>
        </div>
         </form>
       </div>
      
     </div>
   </div>
 </div>


 <div class="modal fade right" id="approve" tabindex="-1" role="dialog" style="width:50%; height:100%;" aria-labelledby="approval_modalTitle" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-scrollable" role="document">
    <div class="modal-content" style="border-radius: 10px 10px;">
      <div class="modal-header bg-primary">
        <h5 class="modal-title text-white">Approve/Disapprove</h5>
        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true" class="text-white btn-sm btn-danger">Close</span>
        </button>
      </div>
      <div class="modal-body bg-light">
    <form method="POST" class="uploadfileapproval">
        <input type="hidden" name="promo_id" id="promo_id">
        <input type="hidden" name="promo_stage" id="promo_stage">
        <input type="hidden" name="apply_type" id="apply_type" value='0'>
        <div class="clearfix">
        <div class="funkyradio row">
        <div class="funkyradio-primary col-md-6 col-lg-6 col-sm-6">
                <input type="radio" name="radio" class="radio" id="radio1" value="1" />
                <label for="radio1" class="text-dark font-weight-bold" style="font-size:15px;">Approve</label>
            </div>
            <div class="funkyradio-primary col-md-6 col-lg-6 col-sm-6">
                <input type="radio" name="radio" class="radio" id="radio2" value="2"/>
                <label for="radio2" class="text-dark font-weight-bold" style="font-size:15px;">Disapprove</label>
            </div>
        </div>
            <div class="col-lg-12 col-md-12 mt-3">
                <div class="form-group">
                    <label for="comment" class="text-dark font-weight-bold" style="font-size:15px;">Type a Comment</label>
                    <textarea name="comment" id="comment" rows="2" class="form-control" placeholder="Type a comment here..."></textarea>
                </div>
            </div>
            <div class="col-lg-12 col-md-12 mb-4">
                <label for="input-folder-3" class="text-dark font-weight-bold mt-4" style="font-size:15px;">Upload Commitees Report</label><br>
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

<div class="modal fade right" id="return" tabindex="-1" role="dialog" style="width:50%; height:100%;" aria-labelledby="approval_modalTitle" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-scrollable" role="document">
    <div class="modal-content" style="border-radius: 10px 10px;">
      <div class="modal-header bg-primary">
        <h5 class="modal-title text-white">Reverse Application to Applicant for Files Update</h5>
        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true"class="text-white btn-sm btn-danger">Close</span>
        </button>
      </div>
      <div class="modal-body bg-light">
    <form method="POST" class="uploadfilereturn">
        <input type="hidden" name="promo_id" id="promo_id">
        <input type="hidden" name="promo_stage" id="promo_stage">
        <input type="hidden" name="apply_type" id="apply_type" value='0'>
        <div class="clearfix">
        <div class="funkyradio row">
            <div class="col-md-12 col-lg-12 col-sm-12">
            <b>Which file should applicant resend?</b>
            </div>
            <div class="funkyradio-primary col-md-4 col-lg-4 col-sm-4">
                <input type="radio" name="radio" class="radio" id="radio3" value="8" />
                <label for="radio3" class="text-dark font-weight-bold" style="font-size:15px;">Curriculum Vitae (CV)</label>
            </div>
            <div class="funkyradio-primary col-md-4 col-lg-4 col-sm-4">
                <input type="radio" name="radio" class="radio" id="radio4" value="9"/>
                <label for="radio4" class="text-dark font-weight-bold" style="font-size:15px;">Papers</label>
            </div>
            <div class="funkyradio-primary col-md-4 col-lg-4 col-sm-4">
                <input type="radio" name="radio" class="radio" id="radio6" value="11" />
                <label for="radio6" class="text-dark font-weight-bold"
                    style="font-size:15px;">Application Form</label>
            </div>
            <div class="funkyradio-primary col-md-4 col-lg-4 col-sm-4">
                <input type="radio" name="radio" class="radio" id="radio5" value="10" />
                <label for="radio5" class="text-dark font-weight-bold" style="font-size:15px;">CV, Papers
            and Application Form</label>
            </div>
        </div>
            <div class="col-lg-12 col-md-12 mb-4">
                <div class="form-group">
                    <label for="comment1" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Give a Comment/Reason </strong></label>
                    <textarea name="comment1" id="comment1" rows="2" class="form-control" placeholder="Type a comment here..."></textarea>
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
    $("#approve").on('show.bs.modal', function(event){
        var button = $(event.relatedTarget);
        var promo_id = button.data('id');
        var promo_stage = button.data('entry');

        var modal = $(this);
        modal.find('.modal-body #promo_id').val(promo_id);
        modal.find('.modal-body #promo_stage').val(promo_stage);
    })
</script> -->