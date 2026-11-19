<?php
foreach($data['users'] as $user){

}
?>
<section class=" profile-page">
    <div class="container-fluid">       
        <div class="row clearfix block-header">
            <div class="col-lg-12 col-md-12">
                <a href="../appraisal_hod" class="d-print-none btn btn-primary">Go Back </a>
                <div class="card d-print-none bg-light">
                    <ul class="nav nav-tabs">
                        <li class="nav-item"><a class="nav-link active" data-toggle="tab" href="#mypost">Apparaisal Form A</a></li>
                        <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#timeline">Apparaisal Form B</a></li>
                    </ul>
                </div>
                <div class="tab-content">
                    <div role="tabpanel" class="tab-pane blog-page active" id="mypost">
                        <div class="row clearfix">
                        <div class="card">
                            <div class="body print-container">
                            <div class="col-lg-12 col-md-12 col-sm-12 d-none d-print-block">
                                <h1 class="hd1 text-center">FORM A </h1>
                                <h1 class="hd1 text-center">UNIVERSITY OF CAPE COAST </h1>
                                <h2 class="hd1 text-center">STAFF SELF-APPRAISAL FORM </h2>
                            </div>
                                <div class="header">
                                    <h2 class="hd"><strong class="hd d-print-none">Appriasal</strong> <?=(($user['staff_group'] == 'SM')?'Senior Member':(($user['staff_group'] == 'SS')?'Senior Staff':(($user['staff_group'] == 'JS')?'Junior Staff':'')))?>
                                 </h2>
                                </div>
                                
                                <div>
                                <div class="col-lg-12 col-md-12 col-sm-12">
                                <div class="container-fluid">
                                    <div class="row justify-content-center">
                                        <div class="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center p-0 mt-3 mb-2">
                                            <div class="card px-0 pb-0 mb-3">
                                            <?php
                                            // var_dump($data['users']);
                                            // var_dump($data['appstaff']);
                                             if(!empty($data['appstaff'])):
                                                    foreach($data['appstaff'] as $appdata){
                                                    }
                                                    ?>
                                                <form id="app_form" method="POST">
                                                    <fieldset>
                                                        <div class="form-card">
                                                        <div class="row">
                                                                <div class="col-12 v-tit mb-4">
                                                                    <h2 class="fs-title">Personal Details:</h2>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-md-6 em">
                                                                <label class="fieldlabels">Name of Employee: </label> 
                                                                <input class="form-control-plaintext mb-4" readonly value="<?=$user['title'].' '.$user['fname'].' '.$user['mname'].' '.$user['lname'];?>"/>
                                                                </div>
                                                                <div class="col-md-6 em">
                                                                <label class="fieldlabels">Staff No.: </label> 
                                                                <input class="form-control-plaintext mb-4" readonly value="<?=$user['staff_no']?>"/>
                                                                </div>
                                                                <div class="col-md-6 em1">
                                                                <label class="fieldlabels">Employee's Designation/Rank:</label> 
                                                                <input class="form-control-plaintext mb-4" readonly value="<?= $user['jobtitle'];?>"/>
                                                                </div>
                                                                <div class="col-md-6 em1">
                                                                <label class="fieldlabels">Employee's Department:</label> 
                                                                <input class="form-control-plaintext mb-4" readonly value="<?= $user['long_name'];?>"/>
                                                                </div>
                                                            </div><hr>
                                                            <div class="row">
                                                            <div class="col-12 v-tit mb-4">
                                                                <h2 class="fs-title">Supervisor's Details:</h2>
                                                            </div>
                                                                <div class="col-md-4 sd">
                                                                <label class="fieldlabels">Supervisor's Name: *</label> 
                                                                <input type="text" class="form-control-plaintext" readonly  placeholder="Supervisor's Name" value="<?=$appdata['supervisor_name'];?>"/>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                <label class="fieldlabels">Supervisor's Designation/Rank: *</label> 
                                                                <input type="text" class="form-control-plaintext" readonly  name="supervisors_rank" id="supervisors_rank" placeholder="Supervisors Rank" value="<?=$appdata['supervisors_rank'];?>"/>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                <label class="fieldlabels">Year Under Review: *</label>
                                                                <input type="text" class="form-control-plaintext" readonly  name="yr_review" id="yr_review" placeholder="Supervisors Rank" value="<?=$appdata['yr_onreview'];?>"/>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <hr><br>
                                                        <input type="hidden" name="staff_no" id="staff_no" value="<?= $user['staff_no'];?>" />
                                                        <div class="form-card">
                                                            <div class="row">
                                                                <div class="col-12 v-tit mb-4">
                                                                    <h2 class="fs-title">Professional Information:</h2>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels">List your most significant accomplishments this past year: *</label> 
                                                                <textarea name="accomplishments" id="accomplishments" class="form-control-plaintext p-2" readonly 
                                                                placeholder="- Type significant accomplishments here"><?=$appdata['accomplishments'];?>
                                                                </textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels"> List any barriers or challenges that you have: *</label> 
                                                                <textarea name="barriers_challenges" id="barriers_challenges" class="form-control-plaintext p-2" readonly  
                                                                placeholder="- Type barriers or challenges that you have"><?=$appdata['barriers_challenges']?>
                                                                </textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels"> How has this barrier(s)/challenge(s) helped you to accomplish your goals: *</label> 
                                                                <textarea name="barriers_challenges_goal" id="barriers_challenges_goal" class="form-control-plaintext p-2" readonly  
                                                                placeholder="- Type barrier(s)/challenge(s) helped you to accomplish your goals"><?=$appdata['barriers_challenges_goal']?>
                                                                </textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels"> Please list your area(s) of strength and area(s) of improvement: *</label> 
                                                                <textarea name="strength_improvement" id="strength_improvement" class="form-control-plaintext p-2" readonly  
                                                                placeholder="- List your area(s) of strength and area(s) of improvement"><?=$appdata['strength_improvement']?>
                                                                </textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels"> What skills or new knowledge would you like to develop to improve your performance?: *</label> 
                                                                <textarea name="new_knowledge" id="new_knowledge" class="form-control-plaintext p-2" 
                                                                readonly  placeholder="- Enter skills or new knowledge would you like to develop (if any)"><?=$appdata['new_knowledge']?>
                                                                </textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels"> Is there any other information you would like to share with your supervisor regarding your work performance?: *</label> 
                                                                <textarea name="other_information" id="other_information" class="form-control-plaintext p-2" readonly  
                                                                placeholder="- List other information you would like to share here"><?=$appdata['other_information']?>
                                                                </textarea>
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
                                                                <label class="fieldlabels">Supervisor's Name: *</label> 
                                                                <input type="text" class="form-control-plaintext" readonly  placeholder="Supervisors Name" value="<?=$appdata['supervisor_name'];?>"/>
                                                                </div>
                                                                <div class="col-md-12 mt-4">
                                                                <p class="d-none d-print-block"><?=(($appdata['sup_signed'] == 'Supervisor Signed')?'<i class="zmdi zmdi-check"></i> ':'')?> Supervisor Signed</p>
                                                                <label class="customcheck d-print-none" for="sup_signed">Supervisor Signed
                                                                    <input type="checkbox" name="sup_signed" class="form-check-input"  id="sup_signed" <?=(!empty($appdata['sup_signed'])?'checked disabled':'')?> value="Supervisor Signed">
                                                                    <span class="checkmark d-print-none"></span>
                                                                    </label>
                                                                </div>
                                                                </div>
                                                                <div class="col-md-6 row bg-light p-5 rounded mm">
                                                                <div class="col-md-12 mb-3">
                                                                <label class="fieldlabels" for="employee_name">Employee Name: *</label> 
                                                                <input type="text" name="employee_name" class="form-control-plaintext" readonly  placeholder="Employee Name" value="<?=$user['title'].' '.$user['fname'].' '.$user['mname'].' '.$user['lname'];?>"/>
                                                                </div>
                                                                <div class="col-md-12 mt-4">
                                                                <p class="d-none d-print-block"><?=(($appdata['emp_signed'] == 'Employee Signed')?'<i class="zmdi zmdi-check"></i> ':'')?> Employee Signed</p>
                                                                <label class="customcheck d-print-none" for="emp_signed">Employee Signed
                                                                    <input type="checkbox" name="emp_signed" class="form-check-input" disabled  id="emp_signed" <?=(!empty($appdata['emp_signed'])?'checked':'')?> value="Supervisor Signed">
                                                                    <span class="checkmark d-print-none"></span>
                                                                    </label>
                                                                </div>
                                                                </div>
                                                            </div>
                                                        </div> 
                                                        <br><br>
                                                        <div class="col-md-12">
                                                        <input type="hidden" name="app_self_id" id="app_self_id" value="<?=$appdata['app_self_id']?>"/> 
                                                        <?=(($appdata['app_status'] == 2)?'<button class="btn btn-block d-print-none text-bold" onclick="print()" 
                                                        style="background-color:#d3242c;" style="width:100%;"><i class="zmdi zmdi-print"></i> Print </button>':
                                                        '<input type="submit" name="submit" id="submit" class="btn btn-block text-bold" style="background-color:#d3242c;" style="width:100%;" value="Submit" />')?> 
                                                        </div>
                                                    </fieldset>
                                                </form>
                                                <?php else:?>
                                                    <form method="POST">
                                                    <fieldset>
                                                        <div class="form-card">
                                                        <div class="row">
                                                                <div class="col-7">
                                                                    <h2 class="fs-title">Personal Details:</h2>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                            <div class="col-md-6 em">
                                                                <label class="fieldlabels">Name of Employee: </label> 
                                                                <input type="fname" name="fname" class="form-control-plaintext mb-4" readonly  placeholder="Full Name" value="<?=$user['title'].' '.$user['fname'].' '.$user['mname'].' '.$user['lname'];?>"/>
                                                                </div>
                                                                <div class="col-md-6 em">
                                                                <label class="fieldlabels">Staff No.: </label> 
                                                                <input type="staff_no" name="staff_no" class="form-control-plaintext mb-4" readonly  placeholder="Staff Number" value="<?=$user['staff_no']?>"/>
                                                                </div>
                                                                <div class="col-md-6 em1">
                                                                <label class="fieldlabels">Employee's Designation/Rank:</label> 
                                                                <input type="email" name="email" class="form-control-plaintext mb-4" readonly  placeholder="Email Id" value="<?= $user['jobtitle'];?>"/>
                                                                </div>
                                                                <div class="col-md-6 em1">
                                                                <label class="fieldlabels">Employee's Department:</label> 
                                                                <input type="text" name="phoneno" class="form-control-plaintext mb-4" readonly  placeholder="Phone Number" value="<?= $user['long_name'];?>"/>
                                                                </div>
                                                            </div><hr>
                                                            <div class="row">
                                                            <div class="col-12 mb-4">
                                                                <h2 class="fs-title">Supervisor's Details:
                                                                <?php //var_dump($data['userhead'])?></h2>
                                                            </div>
                                                                <div class="col-md-4 sd">
                                                                <label class="supervisor_name">Supervisor's Name: *</label>
                                                                <select class="d-block" style="width:100%;" name="supervisor_name" class="form-control" id="supervisor_name">
                                                                    <option value="">- Select Supervisor's Name -</option>
                                                                    <?php foreach($data['userhead'] as $head){?> 
                                                                        <option value="<?=$head['title'].' '.$head['fname'].' '.$head['mname'].' '.$head['lname'];?>"><?=$head['fname'].' '.$head['mname'].' '.$head['lname'];?></option>
                                                                    <?php }?>
                                                                </select>
                                                                
                                                                <input type="hidden" name="staff_no" id="staff_no" value="<?= $user['staff_no'];?>" />
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                <label class="supervisors_rank">Supervisor's Designation/Rank: *</label>
                                                                <select class="d-block" style="width:100%;" name="supervisors_rank" class="form-control" id="supervisors_rank">
                                                                    <option value="">- Select Supervisor's Name -</option>
                                                                <?php foreach($data['userhead'] as $head){?> 
                                                                    <option value="<?=$head['jobtitle'];?>"><?=$head['jobtitle'];?></option>
                                                                <?php }?> 
                                                                </select>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                <label class="yr_review">Year Under Review: *</label>
                                                                <select class="d-block" style="width:100%;" name="yr_review" class="form-control" id="yr_review">
                                                                    <option value="">- Select Year -</option>
                                                                    <option value="<?=date("Y")?>"><?=date("Y")?></option>
                                                                </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <hr><br>
                                                        <div class="form-card">
                                                            <div class="row">
                                                                <div class="col-7 mb-4">
                                                                    <h2 class="fs-title">Professional Information:</h2>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels">List your most significant accomplishments this past year: *</label> 
                                                                <textarea name="accomplishments" id="accomplishments" class="form-control" placeholder="- Type significant accomplishments here"></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels"> List any barriers or challenges that you have: *</label> 
                                                                <textarea name="barriers_challenges" id="barriers_challenges" class="form-control" placeholder="- Type barriers or challenges that you have"></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels"> How has this barrier(s)/challenge(s) helped you to accomplish your goals: *</label> 
                                                                <textarea name="barriers_challenges_goal" id="barriers_challenges_goal" class="form-control" placeholder="- Type barrier(s)/challenge(s) helped you to accomplish your goals"></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels"> Please list your area(s) of strength and area(s) of improvement: *</label> 
                                                                <textarea name="strength_improvement" id="strength_improvement" class="form-control" placeholder="- List your area(s) of strength and area(s) of improvement"></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels"> What skills or new knowledge would you like to develop to improve your performance?: *</label> 
                                                                <textarea name="new_knowledge" id="new_knowledge" class="form-control" placeholder="- Enter skills or new knowledge would you like to develop (if any)"></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels"> Is there any other information you would like to share with your supervisor regarding your work performance?: *</label> 
                                                                <textarea name="other_information" id="other_information" class="form-control" placeholder="- List other information you would like to share here"></textarea>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <hr><br>
                                                        <div class="form-card">
                                                        <div class="row">
                                                                <div class="col-12 mb-4">
                                                                    <h2 class="fs-title">Finalization:</h2>
                                                                </div>
                                                                <div class="col-md-6 row bg-light p-5 rounded">
                                                                <div class="col-md-12 mb-3">
                                                                <label class="fieldlabels" for="supervisor_name1">Supervisor's Name: *</label> 
                                                                <input type="text" name="supervisor_name1" class="form-control" readonly placeholder="Supervisors Name"/>
                                                                </div>
                                                                <div class="col-md-12 mt-4">
                                                                <label class="customcheck" for="sup_signed">Supervisor Signed
                                                                    <input type="checkbox" name="sup_signed" class="form-check-input" id="sup_signed" value="Supervisor Signed">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                </div>
                                                                <div class="col-md-6 row bg-light p-5 rounded">
                                                                <div class="col-md-12 mb-3">
                                                                <label class="fieldlabels" for="employee_name">Employee Name: *</label> 
                                                                <input type="text" name="employee_name" readonly class="form-control-plaintext" placeholder="Employee Name" value="<?=$user['title'].' '.$user['fname'].' '.$user['mname'].' '.$user['lname'];?>"/>
                                                                </div>
                                                                <div class="col-md-12 mt-4">
                                                                <label class="customcheck" for="emp_signed">Employee Agree
                                                                    <input type="checkbox" name="emp_signed" class="form-check-input" id="emp_signed" value="Employee Signed">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                </div>
                                                            </div>
                                                        </div> 
                                                        <br><br>
                                                        
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
                    <div role="tabpanel" class="tab-pane" id="timeline">
                    <div class="card">
                            <div class="body">
                                <div class="header">
                                    <h2><strong>Appriasal</strong> Senior Staff</h2>
                                </div>
                                
                                <div class="img-post m-b-15">
                                <div class="col-lg-12 col-md-12 col-sm-12">
                                <div class="container-fluid">
                            <div class="col-lg-12 col-md-12 col-sm-12 d-none d-print-block">
                                <h1 class="hd1 text-center">FORM B </h1>
                                <h1 class="hd1 text-center">UNIVERSITY OF CAPE COAST </h1>
                                <h2 class="hd1 text-center">STAFF APPRAISAL FORM </h2>
                            </div>
                                    <div class="row justify-content-center">
                                        <div class="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center p-0 mt-3 mb-2">
                                            <div class="card px-0 pt-4 pb-0 mb-3">
                                                <?php if(!empty($data['appraisal_b_data'])):
                                                    foreach($data['appraisal_b_data'] as $appraise){}
                                                    ?>
                                                <form id="app_form1" method='POST'>
                                                <fieldset>
                                                        <div class="form-card">
                                                        <div class="row">
                                                                <div class="col-7">
                                                                    <h2 class="fs-title">Personal Details:</h2>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-md-6 em">
                                                                <label class="fieldlabels">Name of Employee: </label> 
                                                                <input type="fname" name="fname" class="form-control-plaintext mb-4" readonly  placeholder="Full Name" value="<?=$user['title'].' '.$user['fname'].' '.$user['mname'].' '.$user['lname'];?>"/>
                                                                </div>
                                                                <div class="col-md-6 em">
                                                                <label class="fieldlabels">Staff No.: </label> 
                                                                <input type="staff_no" name="staff_no" class="form-control-plaintext mb-4" readonly  placeholder="Staff Number" value="<?=$user['staff_no']?>"/>
                                                                </div>
                                                                <div class="col-md-6 em1">
                                                                <label class="fieldlabels">Employee's Designation/Rank:</label> 
                                                                <input type="email" name="email" class="form-control-plaintext mb-4" readonly  placeholder="Email Id" value="<?= $user['jobtitle'];?>"/>
                                                                </div>
                                                                <div class="col-md-6 em1">
                                                                <label class="fieldlabels">Employee's Department:</label> 
                                                                <input type="text" name="phoneno" class="form-control-plaintext mb-4" readonly  placeholder="Phone Number" value="<?= $user['long_name'];?>"/>
                                                                </div>
                                                            </div><hr>
                                                            <div class="row">
                                                                <div class="col-12 mb-4">
                                                                    <h2 class="fs-title">Supervisor's Details:</h2>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                <label class="fieldlabels">Supervisor's Name: *</label> 
                                                                <input type="text" name="supervisor_name1" class="form-control-plaintext" id="supervisor_name1" placeholder="Supervisor's Name" value="<?=$appraise['supervisor_name'];?>"/>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                <label class="fieldlabels">Supervisor's Designation/Rank: *</label> 
                                                                <input type="text" class="form-control-plaintext" name="supervisors_rank" id="supervisors_rank" placeholder="Supervisors Rank" value="<?=$appraise['supervisors_rank'];?>"/>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                <label class="fieldlabels">Year Under Review: *</label>
                                                                <input type="text" class="form-control-plaintext" value="<?=$appraise['yr_onreview'];?>"/>
                                                                </div>
                                                            </div><hr>
                                                        <input type="hidden" name="staff_no" id="staff_no" value="<?= $user['staff_no'];?>" />
                                                            <div class="row">
                                                                <div class="col-12 mb-4">
                                                                    <h2 class="fs-title">Purpose of Current Review:</h2>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                <p class="d-none d-print-block"><?=(($appraise['purpose_curr_review'] == 'Annual Appraisal')?'<i class="zmdi zmdi-check"></i> ':'')?> Annual Appraisal</p>
                                                                    <label class="customcheck d-print-none" for="annual_appraisal">Annual Appraisal
                                                                    <input class="form-check-input" disabled type="checkbox" name="purpose_curr_review[]" <?=(($appraise['purpose_curr_review'] == 'Annual Appraisal')?'checked':'')?> id="annual_appraisal" value="Annual Appraisal">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                <p class="d-none d-print-block"><?=(($appraise['sup_signed'] == 'Provisional Mid-Point')?'<i class="zmdi zmdi-check"></i> ':'')?> Provisional Mid-Point</p>
                                                                    <label class="customcheck d-print-none" for="provisional">Provisional Mid-Point
                                                                    <input class="form-check-input" disabled type="checkbox" name="purpose_curr_review[]" <?=(($appraise['purpose_curr_review'] == 'Provisional Mid-Point')?'checked':'')?> id="provisional" value="Provisional Mid-Point">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                <p class="d-none d-print-block"><?=(($appraise['purpose_curr_review'] == 'Special')?'<i class="zmdi zmdi-check"></i> ':'')?> Special</p>
                                                                    <label class="customcheck d-print-none" for="special">Special
                                                                    <input class="form-check-input" disabled type="checkbox" name="purpose_curr_review[]" <?=(($appraise['purpose_curr_review'] == 'Special')?'checked':'')?> id="special" value="Special">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div> 
                                                    </fieldset>
                                                    <hr><br>
                                                    <fieldset>
                                                        <div class="form-card">
                                                            <div class="row text-center">
                                                                <div class="col-2 sd1">
                                                                    <p>U = Unsatisfactory</p>
                                                                </div>
                                                                <div class="col-2 sd1">
                                                                    <p>S = Satisfactory</p>
                                                                </div>
                                                                <div class="col-2 sd1">
                                                                    <p>S = Successful</p>
                                                                </div>
                                                                <div class="col-3 sd1">
                                                                    <p>A = Above Expectations</p>
                                                                </div>
                                                                <div class="col-2 sd1">
                                                                    <p>E = Exceptional</p>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-12 mb-4">
                                                                    <h2 class="fs-title">Professional Information:</h2>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                            <table class="table-bordered" style="font-family: Old Standard TT; font-size: 15px; width: 100%">
                                                                <caption class="text-center">U = Unsatisfactory *----------* S = Satisfactory *----------* S = Successful *----------* A = Above Expectations *----------* E = Exceptional</caption>
                                                            <thead class="text-white" style="background-color:#1C2473">
                                                            <tr style="font-size: 12px; text-transform: uppercase;">
                                                                <td class="text-center" width="65%"></td>
                                                                <td class="text-center" width="5.25%">U</td>
                                                                <td class="text-center" width="5.25%">S</td>
                                                                <td class="text-center" width="5.25%">S</td>
                                                                <td class="text-center" width="5.25%">A</td>
                                                                <td class="text-center" width="5.25%">E</td>
                                                                <td class="text-center" width="10%">Examples to Support Rating</td>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                                
                                                            <?php //var_dump($data['appraisal_b_data']); 
                                                            foreach($data['appraisal_b_data'] as $app_data): 
                                                                $q_data = explode(':', $app_data['question']);
                                                                ?>                                                            
                                                            <tr style="font-size: 14px; background-color: #D2D2D2;" class="bg1">
                                                                <th class="p-2" width="50%"><?php echo $app_data['cat_name']; ?>
                                                                
                                                                </th>
                                                            </tr>
                                                            <?php foreach($q_data as $questions):
                                                                $quest = explode('|', $questions);
                                                                // print_r($quest);
                                                                ?>
                                                            <tr style="font-size: 14px;">
                                                                <td class="pl-5" width="50%"><ul><li><?php echo $quest[0]; ?></li></ul></td>
                                                                <td class="text-center" width="5.25%">
                                                                <?=(($quest[1] == 'U')?'<p class="d-none d-print-block"><i class="zmdi zmdi-check"></i></p>
                                                                <label class="customcheck ml-3 mb-4 d-print-none" for="Unsatisfactory">
                                                                    <input type="checkbox" disabled class="form-check-input" id="Unsatisfactory" checked>
                                                                    <span class="checkmark"></span>
                                                                    </label>':'');?>
                                                                </td>
                                                                <td class="text-center" width="5.25%">
                                                                <?=(($quest[1] == 'S')?'<p class="d-none d-print-block"><i class="zmdi zmdi-check"></i></p>
                                                                <label class="customcheck ml-3 mb-4 d-print-none" for="Satisfactory">
                                                                    <input type="checkbox" disabled class="form-check-input" id="Satisfactory" checked>
                                                                    <span class="checkmark"></span>
                                                                    </label>':'');?>
                                                                </td>   
                                                                <td class="text-center" width="5.25%">
                                                                <?=(($quest[1] == 'X')?'<p class="d-none d-print-block"><i class="zmdi zmdi-check"></i></p>
                                                                <label class="customcheck d-print-none ml-3 mb-4" for="Successful">
                                                                    <input type="checkbox" disabled class="form-check-input" id="Successful" checked>
                                                                    <span class="checkmark"></span>
                                                                    </label>':'');?>
                                                                </td>
                                                                <td class="text-center" width="5.25%">
                                                                <?=(($quest[1] == 'A')?'<p class="d-none d-print-block"><i class="zmdi zmdi-check"></i></p>
                                                                <label class="customcheck d-print-none ml-3 mb-4" for="above_expectations">
                                                                    <input type="checkbox" disabled class="form-check-input" id="above_expectations" checked>
                                                                    <span class="checkmark"></span>
                                                                    </label>':'');?>
                                                                </td>
                                                                <td class="text-center" width="5.25%">
                                                                <?=(($quest[1] == 'E')?'<p class="d-none d-print-block"><i class="zmdi zmdi-check"></i></p>
                                                                <label class="customcheck d-print-none ml-3 mb-4" for="exceptional">
                                                                    <input type="checkbox" disabled class="form-check-input" id="exceptional" checked>
                                                                    <span class="checkmark"></span>
                                                                    </label>':'');?>
                                                                </td>
                                                                <td class="text-center" width="25%">
                                                                    <input type="text" id="support_eg" class="form-control-plaintext" name="support_eg[]" value="<?=$quest[2];?>">
                                                                </td>
                                                            </tr>
                                                            <?php 
                                                         endforeach;?>
                                                            <?php endforeach;
                                                            ?>
                                                            </tbody>
                                                            </table>
                                                            </div>
                                                        </div> 
                                                    </fieldset><br> <br>
                                                    <fieldset>
                                                        <div class="form-card">
                                                        <div class="row">
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels">Summary of Current Year Objectives: *</label>
                                                                <textarea name="curr_year_obj" readonly id="curr_year_obj" class="form-control-plaintext" placeholder="- Summary of Current Year Objectives"><?=$appraise['curr_year_obj'];?></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels"> Identify Development Needs (Specified areas): *</label> 
                                                                <textarea name="dev_needs" readonly id="dev_needs" class="form-control-plaintext" placeholder="- Identify Development Needs (Specified areas)"><?=$appraise['dev_needs'];?></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels"> Supervisor’s Overall Summary: *</label> 
                                                                <textarea name="overall_summary" readonly id="overall_summary" class="form-control-plaintext" placeholder="- Supervisor’s Overall Summary"><?=$appraise['overall_summary'];?></textarea>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-12 mb-4">
                                                                    <h2 class="fs-title">Supervisor’s Overall Rating (tick):</h2>
                                                                </div>
                                                                <div class="col-2 sd1">
                                                                    <p class="d-none d-print-block"><?=(($appraise['sup_rating'] == 'Unsatisfactory')?'<i class="zmdi zmdi-check"></i> ':'')?> Unsatisfactory</p>
                                                                    <label class="customcheck d-print-none" for="Unsatisfactory">Unsatisfactory
                                                                    <input type="checkbox" disabled name="sup_rating" class="form-check-input" id="unsatisfactory" <?=(($appraise['sup_rating'] == 'Unsatisfactory')?'checked':'')?> value="Unsatisfactory">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                <div class="col-2 sd1">
                                                                    <p class="d-none d-print-block"><?=(($appraise['sup_rating'] == 'satisfactory')?'<i class="zmdi zmdi-check"></i> ':'')?> Satisfactory</p>
                                                                    <label class="customcheck d-print-none" for="satisfactory">Satisfactory
                                                                    <input type="checkbox" disabled name="sup_rating" class="form-check-input" id="satisfactory"<?=(($appraise['sup_rating'] == 'satisfactory')?'checked':'')?> value="satisfactory">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                <div class="col-2 sd1">
                                                                    <p class="d-none d-print-block"><?=(($appraise['sup_rating'] == 'Successful')?'<i class="zmdi zmdi-check"></i> ':'')?> Successful</p>
                                                                    <label class="customcheck d-print-none" for="successful">Successful
                                                                    <input type="checkbox" disabled name="sup_rating" class="form-check-input" id="successful"<?=(($appraise['sup_rating'] == 'Successful')?'checked':'')?> value="Successful">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                <div class="col-3 sd1">
                                                                    <p class="d-none d-print-block"><?=(($appraise['sup_rating'] == 'Above Expectations')?'<i class="zmdi zmdi-check"></i> ':'')?> Above Expectations</p>
                                                                <label class="customcheck d-print-none" for="above_expectations">Above Expectations
                                                                    <input type="checkbox" disabled name="sup_rating" class="form-check-input" id="above_expectations"<?=(($appraise['sup_rating'] == 'Above Expectations')?'checked':'')?> value="Above Expectations">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                <div class="col-2 sd1">
                                                                    <p class="d-none d-print-block"><?=(($appraise['sup_rating'] == 'Exceptional')?'<i class="zmdi zmdi-check"></i> ':'')?> Exceptional</p>
                                                                <label class="customcheck d-print-none" for="exceptional">Exceptional
                                                                    <input type="checkbox" disabled name="sup_rating" class="form-check-input" id="exceptional" <?=(($appraise['sup_rating'] == 'Exceptional')?'checked':'')?> value="Exceptional">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <hr><br>
                                                            <div class="col-md-12 col-sm-12 col-lg-12">
                                                            <label class="fieldlabels"> Employee Comments (Optional): *</label> 
                                                            <textarea name="emp_comments" readonly id="emp_comments" class="form-control-plaintext" placeholder="- Employee Comments (Optional)"><?=$appraise['emp_comments']?></textarea>
                                                            </div>
                                                            </div>
                                                             
                                                    </fieldset><br><br>
                                                    <fieldset>
                                                        <div class="form-card">
                                                        <div class="row">
                                                                <div class="col-12 mb-4">
                                                                    <h2 class="fs-title">Finalization:</h2>
                                                                </div>
                                                                <div class="col-md-6 row bg-light p-5 rounded mm">
                                                                <div class="col-md-12 mb-3">
                                                                <label class="fieldlabels" for="supervisor_name1">Supervisor's Name: *</label> 
                                                                <input type="text" name="supervisor_name1" class="form-control-plaintext" value="<?=$appraise['supervisor_name']?>" disabled placeholder="Supervisors Name"/>
                                                                </div>
                                                                <div class="col-md-12 mt-4">
                                                                <p class="d-none d-print-block"><?=(($appraise['sup_signed'] == 'Supervisor Signed')?'<i class="zmdi zmdi-check"></i> ':'')?> Supervisor Signed</p>
                                                                <label class="customcheck d-print-none" for="sup_signed1">Supervisor Signed
                                                                    <input type="checkbox" name="sup_signed1" disabled class="form-check-input" id="sup_signed1" <?=(($appraise['sup_signed'] == 'Supervisor Signed')?'checked':'')?> value="Supervisor Signed">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                </div>
                                                                <div class="col-md-6 row bg-light p-5 rounded mm">
                                                                <div class="col-md-12 mb-3">
                                                                <label class="fieldlabels" for="employee_name">Employee Name: *</label> 
                                                                <input type="text" name="employee_name" value="<?=$user['title'].' '.$user['fname'].' '.$user['mname'].' '.$user['lname'];?>" class="form-control-plaintext" placeholder="Employee Name"/>
                                                                </div>
                                                                <div class="col-md-12 mt-4">
                                                                <p class="d-none d-print-block"><?=(($appraise['emp_signed'] == 'Employee Signed')?'<i class="zmdi zmdi-check"></i> ':'')?> Employee Signed</p>
                                                                <label class="customcheck d-print-none" for="emp_signed">Employee Signed
                                                                    <input type="checkbox" name="emp_signed" disabled class="form-check-input" id="emp_signed" <?=(($appraise['emp_signed'] == 'Employee Signed')?'checked':'')?> value="Employee Signed">
                                                                    <span class="checkmark d-print-none"></span>
                                                                    </label>
                                                                </div>
                                                                </div>
                                                                
                                                            </div>
                                                        </div>
                                                        <div class="col-md-12">
                                                        <input type="hidden" name="app_self_id" id="app_self_id" value="<?=$appdata['app_self_id']?>"/> 
                                                        <?=(($appdata['app_status'] == 2)?'<button class="btn btn-block d-print-none text-bold" onclick="print()" 
                                                        style="background-color:#d3242c;" style="width:100%;"><i class="zmdi zmdi-print"></i> Print </button>':'')?> 
                                                        </div>
                                                    </fieldset>
                                                </form>
                                                <?php else: 

                                                    foreach($data['getstdata'] as $staff_data){
                                                    }?>
                                                    <form id="app_form1" method='POST'>
                                                <fieldset>
                                                        <div class="form-card">
                                                        <div class="row">
                                                                <div class="col-7">
                                                                    <h2 class="fs-title">Personal Details:</h2>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                            <div class="col-md-6 em">
                                                                <label class="fieldlabels">Name of Employee: </label> 
                                                                <input type="fname" name="fname" class="form-control-plaintext mb-4" readonly  placeholder="Full Name" value="<?=$user['title'].' '.$user['fname'].' '.$user['mname'].' '.$user['lname'];?>"/>
                                                                </div>
                                                                <div class="col-md-6 em">
                                                                <label class="fieldlabels">Staff No.: </label> 
                                                                <input type="staff_no" name="staff_no" class="form-control-plaintext mb-4" readonly  placeholder="Staff Number" value="<?=$user['staff_no']?>"/>
                                                                </div>
                                                                <div class="col-md-6 em1">
                                                                <label class="fieldlabels">Employee's Designation/Rank:</label> 
                                                                <input type="email" name="email" class="form-control-plaintext mb-4" readonly  placeholder="Email Id" value="<?= $user['jobtitle'];?>"/>
                                                                </div>
                                                                <div class="col-md-6 em1">
                                                                <label class="fieldlabels">Employee's Department:</label> 
                                                                <input type="text" name="phoneno" class="form-control-plaintext mb-4" readonly  placeholder="Phone Number" value="<?= $user['long_name'];?>"/>
                                                                </div>
                                                            </div><hr>
                                                        <input type="hidden" name="staff_no" id="staff_no" value="<?= $user['staff_no'];?>" />
                                                            <div class="row">
                                                                <div class="col-12 mb-4">
                                                                    <h2 class="fs-title">Supervisor's Details:</h2>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                <label class="fieldlabels">Supervisor's Name: *</label>
                                                                <select class="d-block" style="width:100%;" name="supervisor_name1" class="form-control" id="supervisor_name1">
                                                                    <option value="">- Select Supervisor's Name -</option>
                                                                    <?php foreach($data['userhead'] as $head){?> 
                                                                        <option value="<?=$head['title'].' '.$head['fname'].' '.$head['mname'].' '.$head['lname'];?>"><?=$head['fname'].' '.$head['mname'].' '.$head['lname'];?></option>
                                                                    <?php }?>
                                                                </select>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                <label class="fieldlabels">Supervisor's Designation/Rank: *</label>
                                                                <select class="d-block" style="width:100%;" name="supervisors_rank" class="form-control" id="supervisors_rank">
                                                                    <option value="">- Select Supervisor's Rank -</option>
                                                                <?php foreach($data['userhead'] as $head){?> 
                                                                    <option value="<?=$head['jobtitle'];?>"><?=$head['jobtitle'];?></option>
                                                                <?php }?> 
                                                                </select>
                                                                </div>
                                                                <div class="col-md-4  sd">
                                                                <label class="fieldlabels">Year Under Review: *</label>
                                                                <select class="d-block" style="width:100%;" name="yr_onreview" id="yr_onreview">
                                                                    <option value="<?=date("Y")?>">- <?=date("Y")?> -</option>
                                                                    <option value="<?=date("Y")?>"><?=date("Y")?></option>
                                                                </select>
                                                                </div>
                                                            </div><hr>
                                                            <div class="row">
                                                                <div class="col-12 mb-4">
                                                                    <h2 class="fs-title">Purpose of Current Review:</h2>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                    <label class="customcheck" for="annual_appraisal">Annual Appraisal
                                                                    <input class="form-check-input" type="checkbox" name="purpose_curr_review" id="annual_appraisal" value="Annual Appraisal">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                    <label class="customcheck" for="provisional">Provisional Mid-Point
                                                                    <input class="form-check-input" type="checkbox" name="purpose_curr_review" id="provisional" value="Provisional Mid-Point">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                    <label class="customcheck" for="special">Special
                                                                    <input class="form-check-input" type="checkbox" name="purpose_curr_review" id="special" value="Special">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div> 
                                                    </fieldset>
                                                    <hr><br>
                                                    <fieldset>
                                                        <div class="form-card">
                                                            <div class="row text-center">
                                                                <div class="col-3">
                                                                    <p>U = Unsatisfactory</p>
                                                                </div>
                                                                <div class="col-2">
                                                                    <p>S = Satisfactory</p>
                                                                </div>
                                                                <div class="col-2">
                                                                    <p>S = Successful</p>
                                                                </div>
                                                                <div class="col-3">
                                                                    <p>A = Above Expectations</p>
                                                                </div>
                                                                <div class="col-2">
                                                                    <p>E = Exceptional</p>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-12 mb-4">
                                                                    <h2 class="fs-title">Professional Information:</h2>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                            <table class="table-bordered" style="font-family: Old Standard TT; font-size: 15px; width: 100%">
                                                                <caption class="text-center">U = Unsatisfactory *----------* S = Satisfactory *----------* S = Successful *----------* A = Above Expectations *----------* E = Exceptional</caption>
                                                            <thead class="text-white" style="background-color:#1C2473">
                                                            <tr style="font-size: 12px; text-transform: uppercase;">
                                                                <th class="text-center" width="65%"></th>
                                                                <th class="text-center" width="5.25%">U</th>
                                                                <th class="text-center" width="5.25%">S</th>
                                                                <th class="text-center" width="5.25%">S</th>
                                                                <th class="text-center" width="5.25%">A</th>
                                                                <th class="text-center" width="5.25%">E</th>
                                                                <th class="text-center" width="10%">Examples to Support Rating</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                                
                                                            <?php
                                                                // var_dump($data['appraisal_b']);
                                                                foreach($data['appraisal_b'] as $app_data): 
                                                                $q_data = explode(':', $app_data['question']);
                                                                ?>
                                                            <tr style="font-size: 14px; background-color: #D2D2D2;">
                                                                
                                                                <td class="p-2" width="55%"><?php echo $app_data['cat_name']; ?>
                                                                <input type="hidden" name="cat_id[]" id="cat_id" value="<?=$app_data['cat_id'];?>">
                                                                </td>
                                                            </tr>
                                                            <?php foreach($q_data as $questions):
                                                                $quest = explode('|', $questions);
                                                                ?>
                                                            <tr style="font-size: 14px;">
                                                                <td class="pl-5" width="50%"><ul><li><?php echo $quest[0]; ?>
                                                                <input type="hidden" name="cat_id[]" id="cat_id" value="<?=$app_data['cat_id'];?>">
                                                                <input type="hidden" name="cat_name[]" id="cat_name" value="<?=$app_data['cat_name'];?>">
                                                                <input type="hidden" class="form-control" id="Successful" name="question[]" value="<?=$quest[0];?>">
                                                                </li></ul></td>
                                                                <td class="text-center" width="5.25%">
                                                                <!-- <label class="customcheck d-print-none ml-3 mb-4" for="Successful">
                                                                    <input type="checkbox" class="form-check-input" id="Unsatisfactory" name="radiobtn[]" value="<?='U';?>">
                                                                    <span class="checkmark"></span>
                                                                    </label> -->
                                                                    <input type="checkbox" class="form-control" id="Unsatisfactory" name="radiobtn[]" value="<?='U';?>">
                                                                </td>
                                                                <td class="text-center" width="5.25%">
                                                                    <input type="checkbox" class="form-control" id="Satisfactory" name="radiobtn[]" value="<?='S';?>">
                                                                </td>
                                                                <td class="text-center" width="5.25%">
                                                                    <input type="checkbox" class="form-control" id="Successful" name="radiobtn[]" value="<?='X';?>">
                                                                </td>
                                                                <td class="text-center" width="5.25%">
                                                                    <input type="checkbox" class="form-control" id="Above Expectations" name="radiobtn[]" value="<?='A';?>">
                                                                </td>
                                                                <td class="text-center" width="5.25%">
                                                                    <input type="checkbox" class="form-control" id="Exceptional" name="radiobtn[]" value="<?='E';?>">
                                                                </td>
                                                                <td class="text-center" width="25%">
                                                                    <input type="hidden" name="cat_id[]" id="cat_id" value="<?=$app_data['cat_id'];?>">
                                                                    <input type="hidden" name="question_id[]" id="question_id" value="<?=$quest[1];?>">
                                                                    <input type="text" id="support_eg" class="form-control" name="support_eg[]" placeholder="Type Here...">
                                                                </td>
                                                            </tr>
                                                            <?php endforeach;?>
                                                            <?php endforeach;?>
                                                            </tbody>
                                                            </table>
                                                            </div>
                                                        </div> 
                                                    </fieldset><br> <br>
                                                    <fieldset>
                                                        <div class="form-card">
                                                        <div class="row">
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels">Summary of Current Year Objectives: *</label>
                                                                <textarea name="curr_year_obj" id="curr_year_obj" class="form-control" placeholder="- Summary of Current Year Objectives"></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels"> Identify Development Needs (Specified areas): *</label> 
                                                                <textarea name="dev_needs" id="dev_needs" class="form-control" placeholder="- Identify Development Needs (Specified areas)"></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels"> Supervisor’s Overall Summary: *</label> 
                                                                <textarea name="overall_summary" id="overall_summary" class="form-control" placeholder="- Supervisor’s Overall Summary"></textarea>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-12 mb-4">
                                                                    <h2 class="fs-title">Supervisor’s Overall Rating (tick):</h2>
                                                                </div>
                                                                <div class="col-md-3">
                                                                    <label class="customcheck" for="Unsatisfactory">Unsatisfactory
                                                                    <input type="checkbox" name="sup_rating" class="form-control" id="unsatisfactory" value="Unsatisfactory">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                <div class="col-md-2">
                                                                    <label class="customcheck" for="satisfactory">Satisfactory
                                                                    <input type="checkbox" name="sup_rating" class="form-control" id="satisfactory" value="satisfactory">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                <div class="col-md-2">
                                                                    <label class="customcheck" for="successful">Successful
                                                                    <input type="checkbox" name="sup_rating" class="form-control" id="successful" value="Successful">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                <div class="col-md-3">
                                                                <label class="customcheck" for="above_expectations">Above Expectations
                                                                    <input type="checkbox" name="sup_rating" class="form-control" id="above_expectations" value="Above Expectations">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                <div class="col-md-2">
                                                                <label class="customcheck" for="exceptional">Exceptional
                                                                    <input type="checkbox" name="sup_rating" class="form-control" id="exceptional" value="Exceptional">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <hr><br>
                                                            <div class="col-md-12 col-sm-12 col-lg-12">
                                                            <label class="fieldlabels"> Employee Comments (Optional): *</label> 
                                                            <textarea name="emp_comments" id="emp_comments" disabled class="form-control" placeholder="- Employee Comments (Optional)"></textarea>
                                                            </div>
                                                            </div>
                                                             
                                                    </fieldset><br><br>
                                                    <fieldset>
                                                        <div class="form-card">
                                                        <div class="row">
                                                                <div class="col-12 mb-4">
                                                                    <h2 class="fs-title">Finalization:</h2>
                                                                </div>
                                                                <div class="col-md-6 row bg-light p-5 rounded">
                                                                <div class="col-md-12 mb-3">
                                                                <label class="fieldlabels" for="supervisor_name12">Supervisor's Name: *</label> 
                                                                <input type="text" name="supervisor_name12" class="form-control" placeholder="Supervisors Name"/>
                                                                </div>
                                                                <div class="col-md-12 mt-4">
                                                                <label class="customcheck" for="sup_signed1">Supervisor Signed
                                                                    <input type="checkbox" name="sup_signed1" class="form-check-input" id="sup_signed1" value="Supervisor Signed">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                </div>
                                                                <div class="col-md-6 row bg-light p-5 rounded">
                                                                <div class="col-md-12 mb-3">
                                                                <label class="fieldlabels" for="employee_name">Employee Name: *</label> 
                                                                <input type="text" name="employee_name" class="form-control-plaintext" readonly placeholder="Employee Name" value="<?=$user['title'].' '.$user['fname'].' '.$user['mname'].' '.$user['lname'];?>"/>
                                                                </div>
                                                                <div class="col-md-12 mt-4">
                                                                <label class="customcheck" for="emp_signed">Employee Signed
                                                                    <input type="checkbox" name="emp_signed" class="form-check-input" id="emp_signed" value="Employee Signed">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                </div>
                                                                
                                                            </div>
                                                        </div>
                                                        
                                                    </fieldset>
                                                    <input type="submit" name="submit" id="submit" class="btn btn-block text-bold" style="background-color:#d3242c;" value="Submit" /> 
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
</section>

