
<section class="profile-page">
    <div class="block-header">
        <div class="row mt-5">
            <div class="col-lg-12 col-md-12 col-sm-12 d-print-none">
                <h2>Staff Appraisal Form A
                <small class="text-muted">Fill staff appraisal forms here</small>
                </h2>
                <hr>
            </div>
        </div>
    </div>    
    <div class="container-fluid">       
        <div class="row clearfix">
            <div class="col-lg-12 col-md-12">
                <div class="tab-content">
                    <div role="tabpanel" class="tab-pane blog-page active" id="mypost">
                        <div class="card">
                            <div class="body">
                            <div class="col-lg-12 col-md-12 col-sm-12 d-none d-print-block">
                            <!-- <h1 class="hd text-center"><img src="../../public/images/logo/logo.png" width="48" height="48" alt="Compass"></h1> -->
                                <h1 class="hd1 text-center">FORM A </h1>
                                <h1 class="hd1 text-center">UNIVERSITY OF CAPE COAST </h1>
                                <h2 class="hd1 text-center">STAFF SELF-APPRAISAL FORM </h2>
                            </div>
                                <div class="header d-print-none">
                                    <h2><strong>Appriasal</strong> Senior Staff</h2>
                                </div>
                                <div class="img-post m-b-15">
                                <div class="col-lg-12 col-md-12 col-sm-12">
                                <div class="container-fluid">
                                    <div class="row justify-content-center">
                                        <div class="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center p-0 mt-3 mb-2">
                                            <div class="card px-0 pb-0 mb-3">
                                                <?php if(!empty($data['appstaff'])):
                                                    foreach($data['appstaff'] as $appdata){
                                                    }
                                                    ?>
                                                <form id="app_form_a" method="POST">
                                                    <fieldset>
                                                        <div class="form-card">
                                                            <div class="row">
                                                                <div class="col-12 v-tit mb-4">
                                                                    <h2 class="fs-title">Personal Details:</h2>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-md-4">
                                                                <p class="font-weight-bold">Name of Employee: </p> 
                                                                <input type="fname" name="fname" placeholder="Full Name" class="form-control-plaintext mb-4" readonly value="<?=$appdata['fname'].' '.$appdata['mname'].' '.$appdata['lname'];?>"/>
                                                                </div>
                                                                <div class="col-md-4">
                                                                <p class="font-weight-bold">Staff No.: </p> 
                                                                <input type="staff_no" name="staff_no" placeholder="Staff Number" class="form-control-plaintext mb-4" readonly value="<?=$appdata['staff_no']?>"/>
                                                                </div>
                                                                <div class="col-md-4">
                                                                <p class="font-weight-bold">Email:</p> 
                                                                <input type="email" name="email" placeholder="Email Id" class="form-control-plaintext mb-4" readonly value="<?=$appdata['ucc_mail']?>"/>
                                                                </div>
                                                                <div class="col-md-4">
                                                                <p class="font-weight-bold">Phone No:</p> 
                                                                <input type="text" name="phoneno" placeholder="Phone Number" class="form-control-plaintext mb-4" readonly value="<?=$appdata['phone'];?>"/>
                                                                </div>
                                                                <div class="col-md-4">
                                                                <p class="font-weight-bold">Appointment Data:</p> 
                                                                <input type="text" name="app_date" placeholder="Appointment Date" class="form-control-plaintext mb-4" readonly value="<?=$appdata['appoint_date']?>"/>
                                                                </div>
                                                                <div class="col-md-4">
                                                                <p class="font-weight-bold">Job Title:</p> 
                                                                <input type="text" name="Job Title" placeholder="Job Title" class="form-control-plaintext mb-4" readonly value="<?=$appdata['title']?>"/>
                                                                </div>
                                                            </div><hr>
                                                            
                                                            <div class="row">
                                                            <div class="col-12 v-tit mb-4">
                                                                <h2 class="fs-title">Supervisor's Details:</h2>
                                                            </div>
                                                                <div class="col-md-4 sd">
                                                                <p class="font-weight-bold">Supervisor's Name: *</p> 
                                                                <input type="text" class="form-control-plaintext" readonly  placeholder="Supervisor's Name" value="<?=$appdata['supervisor_name'];?>"/>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                <p class="font-weight-bold">Supervisor's Designation/Rank: *</p> 
                                                                <input type="text" class="form-control-plaintext" readonly  name="supervisors_rank" id="supervisors_rank" placeholder="Supervisors Rank" value="<?=$appdata['supervisors_rank'];?>"/>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                <p class="font-weight-bold">Year Under Review: *</p>
                                                                <input type="text" class="form-control-plaintext" readonly  name="yr_review" id="yr_review" placeholder="Supervisors Rank" value="<?=$appdata['yr_onreview'];?>"/>
                                                                <!-- <input type="text" name="yr_review" id="yr_review" placeholder="Year Under Review (eg. 2020)"/> -->
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <hr><br>
                                                        <!-- <input type="button" name="next" class="next action-button" value="Next" /> -->
                                                        <div class="form-card">
                                                            <div class="row">
                                                                <div class="col-12 v-tit mb-4">
                                                                    <h2 class="fs-title">Professional Information:</h2>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <p class="font-weight-bold">List your most significant accomplishments this past year: *</p> 
                                                                <textarea class="form-control-plaintext" rows="4" readonly><?=$appdata['accomplishments'];?></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <p class="font-weight-bold"> List any barriers or challenges that you have: *</p> 
                                                                <textarea class="form-control-plaintext" rows="4" readonly><?=$appdata['barriers_challenges']?></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <p class="font-weight-bold"> How has this barrier(s)/challenge(s) helped you to accomplish your goals: *</p> 
                                                                <textarea class="form-control-plaintext" rows="4" readonly><?=$appdata['barriers_challenges_goal']?></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <p class="font-weight-bold"> Please list your area(s) of strength and area(s) of improvement: *</p> 
                                                                <textarea class="form-control-plaintext" rows="4" readonly><?=$appdata['strength_improvement']?></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <p class="font-weight-bold"> What skills or new knowledge would you like to develop to improve your performance?: *</p> 
                                                                <textarea class="form-control-plaintext" rows="4" readonly><?=$appdata['new_knowledge']?></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <p class="font-weight-bold"> Is there any other information you would like to share with your supervisor regarding your work performance?: *</p> 
                                                                <textarea class="form-control-plaintext" rows="4" readonly><?=$appdata['other_information']?></textarea>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <hr><br>
                                                        <div class="form-card">
                                                        <div class="row">
                                                                <div class="col-12 v-tit mb-4">
                                                                    <h2 class="fs-title">Finalization:</h2>
                                                                </div>
                                                                <div class="col-md-6 row bg-light p-5 rounded mm">
                                                                <div class="col-md-12 mb-3">
                                                                <p class="font-weight-bold">Supervisor's Name: *</p> 
                                                                <input type="text" class="form-control-plaintext" readonly  placeholder="Supervisors Name" value="<?=$appdata['supervisor_name'];?>"/>
                                                                </div>
                                                                <div class="col-md-12 mt-4">
                                                                <p class="d-none d-print-block"><?=(($appdata['sup_signed'] == 'Supervisor Signed')?'<i class="zmdi zmdi-check"></i> ':'')?> Supervisor Signed</p>
                                                                <p class="customcheck d-print-none" for="sup_signed">Supervisor Signature
                                                                    <input type="checkbox" name="sup_signed" class="form-check-input" disabled  id="sup_signed" <?=(!empty($appdata['sup_signed'])?'checked':'')?> value="Supervisor Signed">
                                                                    <span class="checkmark"></span>
                                                                    </p>
                                                                </div>
                                                                <!-- <input type="button" name="previous" class="previous action-button-previous" value="Previous" /> -->
                                                                </div>
                                                                <div class="col-md-6 row bg-light p-5 rounded mm">
                                                                <div class="col-md-12 mb-3">
                                                                <p class="font-weight-bold" for="employee_name">Employee Name: *</p> 
                                                                <input type="text" name="employee_name" class="form-control-plaintext" readonly  placeholder="Employee Name" value="<?=$appdata['fname'].' '.$appdata['mname'].' '.$appdata['lname'];?>"/>
                                                                </div>
                                                                <div class="col-md-12 mt-4">
                                                                <p class="d-none d-print-block"><?=(($appdata['emp_signed'] == 'Employee Signed')?'<i class="zmdi zmdi-check"></i> ':'')?> Employee Signed</p>
                                                                <p class="customcheck d-print-none" for="sup_signed">Employee Signature
                                                                    <input type="checkbox" name="sup_signed" class="form-check-input" disabled  id="emp_signed" <?=(!empty($appdata['emp_signed'])?'checked':'')?> value="Supervisor Signed">
                                                                    <span class="checkmark"></span>
                                                                    </p>
                                                                </div>
                                                                </div>
                                                            </div>
                                                        </div> 
                                                        <br><br>
                                                        <div class="col-md-12">
                                                        <input type="hidden" name="app_self_id" id="app_self_id" value="<?=$appdata['app_self_id']?>"/> 
                                                        <?=(($appdata['app_status'] == 2)?'<button class="btn btn-block d-print-none" onclick="print()" 
                                                        style="background-color:#d3242c;" style="width:100%;"><i class="zmdi zmdi-print"></i> Print </button>':
                                                        '<button type="submit" name="submit" id="submit" class="btn btn-block" style="background-color:#d3242c;" style="width:100%;"><strong>Submit</strong> </button>')?> 
                                                        </div>
                                                    </fieldset>
                                                </form>
                                                <?php else:
                                                    foreach($data['staff'] as $staff_data){
                                                    }?>
                                                    <form id="app_form_a" method="POST">
                                                    <fieldset>
                                                        <div class="form-card">
                                                            <div class="row">
                                                                <div class="col-7">
                                                                    <h2 class="fs-title">Personal Details:</h2>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-md-4">
                                                                <p class="font-weight-bold">Name of Employee: </p> 
                                                                <input type="fname" name="fname" placeholder="Full Name" class="form-control-plaintext mb-4" readonly value="<?=$staff_data['fname'].' '.$staff_data['mname'].' '.$staff_data['lname'];?>"/>
                                                                </div>
                                                                <div class="col-md-4">
                                                                <p class="font-weight-bold">Staff No.: </p> 
                                                                <input type="staff_no" name="staff_no" placeholder="Staff Number" class="form-control-plaintext mb-4" readonly value="<?=$staff_data['staff_no']?>"/>
                                                                </div>
                                                                <div class="col-md-4">
                                                                <p class="font-weight-bold">Email:</p> 
                                                                <input type="email" name="email" placeholder="Email Id" class="form-control-plaintext mb-4" readonly value="<?=$staff_data['ucc_mail']?>"/>
                                                                </div>
                                                                <div class="col-md-4">
                                                                <p class="font-weight-bold">Phone No:</p> 
                                                                <input type="text" name="phoneno" placeholder="Phone Number" class="form-control-plaintext mb-4" readonly value="<?=$staff_data['phone'];?>"/>
                                                                </div>
                                                                <div class="col-md-4">
                                                                <p class="font-weight-bold">Appointment Data:</p> 
                                                                <input type="text" name="app_date" placeholder="Appointment Date" class="form-control-plaintext mb-4" readonly value="<?=$staff_data['appoint_date']?>"/>
                                                                </div>
                                                                <div class="col-md-4">
                                                                <p class="font-weight-bold">Job Title:</p> 
                                                                <input type="text" name="Job Title" placeholder="Job Title" class="form-control-plaintext mb-4" readonly value="<?=$staff_data['title']?>"/>
                                                                </div>
                                                            </div><hr>
                                                            
                                                            <div class="row">
                                                            <div class="col-12">
                                                                <h2 class="fs-title">Supervisor's Details:
                                                                <?php 
                                                                // var_dump($data);
                                                                // die();
                                                                ?></h2>
                                                            </div>
                                                                <div class="col-md-4">
                                                                <p class="supervisor_name">Supervisor's Name: *</p>
                                                                <select class="d-block" style="width:100%;" name="supervisor_name" id="supervisor_name">
                                                                    <option value="">- Select Supervisor's Name -</option>
                                                                    <?php foreach($data['userhead'] as $head){?> 
                                                                        <option value="<?=$head['title'].' '.$head['fname'].' '.$head['mname'].' '.$head['lname'];?>"><?=$head['title'].' '.$head['fname'].' '.$head['mname'].' '.$head['lname'];?></option>
                                                                    <?php }?>
                                                                </select>
                                                                
                                                                </div>
                                                                <div class="col-md-4">
                                                                <p class="supervisors_rank">Supervisor's Designation/Rank: *</p>
                                                                <select class="d-block" style="width:100%;" name="supervisors_rank" id="supervisors_rank">
                                                                    <option value="">- Select Supervisor's Rank -</option>
                                                                <?php foreach($data['userhead'] as $head){?> 
                                                                    <option value="<?=$head['jobtitle'];?>"><?=$head['jobtitle'];?></option>
                                                                <?php }?> 
                                                                </select>
                                                                </div>
                                                                <div class="col-md-4">
                                                                <p class="yr_review">Year Under Review: *</p>
                                                                <select class="d-block" style="width:100%;" name="yr_review" id="yr_review">
                                                                    <option value="">- Select Year -</option>
                                                                    <option value="<?=date("Y")?>"><?=date("Y")?></option>
                                                                </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <hr><br>
                                                        <div class="form-card">
                                                            <div class="row">
                                                                <div class="col-7">
                                                                    <h2 class="fs-title">Professional Information:</h2>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <p class="font-weight-bold">List your most significant accomplishments this past year: *</p> 
                                                                <textarea name="accomplishments" id="accomplishments" class="form-control" placeholder="- Type significant accomplishments here"></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <p class="font-weight-bold"> List any barriers or challenges that you have: *</p> 
                                                                <textarea name="barriers_challenges" id="barriers_challenges" class="form-control" placeholder="- Type barriers or challenges that you have"></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <p class="font-weight-bold"> How has this barrier(s)/challenge(s) helped you to accomplish your goals: *</p> 
                                                                <textarea name="barriers_challenges_goal" id="barriers_challenges_goal" class="form-control" placeholder="- Type barrier(s)/challenge(s) helped you to accomplish your goals"></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <p class="font-weight-bold"> Please list your area(s) of strength and area(s) of improvement: *</p> 
                                                                <textarea name="strength_improvement" id="strength_improvement" class="form-control" placeholder="- List your area(s) of strength and area(s) of improvement"></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <p class="font-weight-bold"> What skills or new knowledge would you like to develop to improve your performance?: *</p> 
                                                                <textarea name="new_knowledge" id="new_knowledge" class="form-control" placeholder="- Enter skills or new knowledge would you like to develop (if any)"></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <p class="font-weight-bold"> Is there any other information you would like to share with your supervisor regarding your work performance?: *</p> 
                                                                <textarea name="other_information" id="other_information" class="form-control" placeholder="- List other information you would like to share here"></textarea>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <hr><br>
                                                        <div class="form-card">
                                                        <div class="row">
                                                                <div class="col-12">
                                                                    <h2 class="fs-title">Finalization:</h2>
                                                                </div>
                                                                <div class="col-md-6 row bg-light p-5 rounded">
                                                                <div class="col-md-12 mb-3">
                                                                <p class="font-weight-bold">Supervisor's Name: *</p> 
                                                                <input type="text" class="form-control" readonly placeholder="Supervisors Name"/>
                                                                </div>
                                                                <div class="col-md-12 mt-4">
                                                                <p class="customcheck" for="sup_signed">Supervisor Signature
                                                                    <input type="checkbox" name="sup_signed" disabled class="form-check-input" id="sup_signed" value="Supervisor Signed">
                                                                    <span class="checkmark"></span>
                                                                    </p>
                                                                </div>
                                                                <!-- <input type="button" name="previous" class="previous action-button-previous" value="Previous" /> -->
                                                                </div>
                                                                <div class="col-md-6 row bg-light p-5 rounded">
                                                                <div class="col-md-12 mb-3">
                                                                <p class="font-weight-bold" for="employee_name">Employee Name: *</p> 
                                                                <input type="text" name="employee_name" readonly class="form-control" placeholder="Employee Name" value="<?=$staff_data['fname'].' '.$staff_data['mname'].' '.$staff_data['lname'];?>"/>
                                                                </div>
                                                                <div class="col-md-12 mt-4">
                                                                <p class="customcheck" for="emp_signed">Employee Signature
                                                                    <input type="checkbox" name="emp_signed" class="form-check-input" id="emp_signed" value="Employee Signed">
                                                                    <span class="checkmark"></span>
                                                                    </p>
                                                                </div>
                                                                </div>
                                                            </div>
                                                        </div> 
                                                        <br><br>
                                                        <div class="form-card"> 
                                                            <div class="row justify-content-center">
                                                                <div class="col-12 text-center">
                                                                    <h5 class="text-danger text-uppercase text-center">
                                                                        Please make sure you have provided accurate data before submitting!!!
                                                                    </h5>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="row">
                                                        <div class="col-md-12">
                                                        <button type="submit" name="submit" id="submit" class="btn btn-block" style="background-color:#d3242c;" style="width:100%;"><strong>Submit</strong></strong> 
                                                        </div>
                                                        </div>
                                                        
                                                    </fieldset>
                                                </form>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                    
                                </div>
                            </div>
                                
                            </div>
                        </div>                
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
<!-- 
