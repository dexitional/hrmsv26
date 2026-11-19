<!-- <section class="profile-page">
    <div class="block-header">
        <div class="row mt-5">
            <div class="col-lg-12 col s12 m12 l12 col-sm-12 d-print-none">
                <h5>Staff Appraisal Form A
                    <small class="text-muted">Fill staff appraisal forms here</small>
                </h5>
                <hr>
            </div>
        </div>
    </div>
    <div class="container-fluid">
        <div class="row clearfix">
            <div class="col-lg-12 col s12 m12 l12">
                <div class="tab-content">
                    <div role="tabpanel" class="tab-pane blog-page active" id="mypost"> -->
<div class="row vertical-modern-dashboard">
    <div class="col s12 m12 l12">
        <div class="animate fadeRight">
            <div class="col s12 m12 l12 text-center p-0 mt-3 mb-2">
                <div class="card px-0 pb-0 mb-3">
                <div class="col s12 m12 l12 d-none d-print-block">
                    <!-- <h1 class="hd text-center"><img src="../../public/images/logo/logo.png" width="48" height="48" alt="Compass"></h1> -->
                    <h3 class="hd1 text-center" style="text-align:center;">FORM A </h3>
                    <h4 class="hd1 text-center" style="text-align:center;">UNIVERSITY OF CAPE COAST </h4>
                    <h5 class="hd1 text-center" style="text-align:center;">STAFF SELF-APPRAISAL FORM </h5>
                </div>
                <div class="header d-print-none">
                    <h5><strong>Appriasal</strong> <?=($data['staff'][0]['staff_group']== 'SM'?'Senior Member':($data['staff'][0]['staff_group']== 'SS'?'Senior Staff':'Junior Staff')) ?> </h5>
                </div>
                    <?php if (!empty($data['appstaff'])) :
                        foreach ($data['appstaff'] as $appdata) {
                        }
                    ?>
                        <form id="" method="POST">
                            <fieldset>
                                <div class="form-card">
                                    <div class="row">
                                        <div class="col s12 m12 l12 mb-4">
                                            <h5 class="fs-title">Personal Details:</h5>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="input-field col s4 m4 l4">
                                            <p class="font-weight-bold">Name of Employee: </p>
                                            <p><?= $appdata['fname'] . ' ' . $appdata['mname'] . ' ' . $appdata['lname']; ?></p>
                                            <!-- <input type="fname" name="fname" placeholder="Full Name" class="form-control-plaintext mb-4" readonly value="<?= $appdata['fname'] . ' ' . $appdata['mname'] . ' ' . $appdata['lname']; ?>" /> -->
                                        </div>
                                        <div class="input-field col s4 m4 l4">
                                            <p class="font-weight-bold">Staff No.: </p>
                                            <p><?= $appdata['staff_no'] ?></p>
                                            <!-- <input type="staff_no" name="staff_no" placeholder="Staff Number" class="form-control-plaintext mb-4" readonly value="<?= $appdata['staff_no'] ?>" /> -->
                                        </div>
                                        <div class="input-field col s4 m4 l4">
                                            <p class="font-weight-bold">Email:</p>
                                            <p><?= $appdata['ucc_mail'] ?></p>
                                            <!-- <input type="email" name="email" placeholder="Email Id" class="form-control-plaintext mb-4" readonly value="<?= $appdata['ucc_mail'] ?>" /> -->
                                        </div>
                                        <div class="input-field col s4 m4 l4">
                                            <p class="font-weight-bold">Phone No:</p>
                                            <p><?= $appdata['phone']; ?></p>
                                            <!-- <input type="text" name="phoneno" placeholder="Phone Number" class="form-control-plaintext mb-4" readonly value="<?= $appdata['phone']; ?>" /> -->
                                        </div>
                                        <div class="input-field col s4 m4 l4">
                                            <p class="font-weight-bold">Appointment Data:</p>
                                            <p><?= $appdata['appoint_date'] ?></p>
                                            <!-- <input type="text" name="app_date" placeholder="Appointment Date" class="form-control-plaintext mb-4" readonly value="<?= $appdata['appoint_date'] ?>" /> -->
                                        </div>
                                        <div class="input-field col s4 m4 l4">
                                            <p class="font-weight-bold">Job Title:</p>
                                            <p><?= $appdata['title'] ?></p>
                                            <!-- <input type="text" name="Job Title" placeholder="Job Title" class="form-control-plaintext mb-4" readonly value="<?= $appdata['title'] ?>" /> -->
                                        </div>
                                    </div>
                                    <hr>

                                    <div class="row">
                                        <div class="col s12 m12 l12 mb-4">
                                            <h5 class="">Supervisor's Details:</h5>
                                        </div>
                                        <div class="input-field col s4 m4 l4 sd">
                                            <p class="font-weight-bold">Supervisor's Name: *</p>
                                            <p><?= $appdata['supervisor_name']; ?></p>
                                            <!-- <input type="text" class="form-control-plaintext" readonly placeholder="Supervisor's Name" value="<?= $appdata['supervisor_name']; ?>" /> -->
                                        </div>
                                        <div class="input-field col s4 m4 l4 sd">
                                            <p class="font-weight-bold">Supervisor's Designation/Rank: *</p>
                                            <p><?= $appdata['supervisors_rank']; ?></p>
                                            <!-- <input type="text" class="form-control-plaintext" readonly name="supervisors_rank" id="supervisors_rank" placeholder="Supervisors Rank" value="<?= $appdata['supervisors_rank']; ?>" /> -->
                                        </div>
                                        <div class="input-field col s4 m4 l4 sd">
                                            <p class="font-weight-bold">Year Under Review: *</p>
                                            <p><?= $appdata['yr_onreview']; ?></p>
                                            <!-- <input type="text" class="form-control-plaintext" readonly name="yr_review" id="yr_review" placeholder="Supervisors Rank" value="<?= $appdata['yr_onreview']; ?>" /> -->
                                            <!-- <input type="text" name="yr_review" id="yr_review" placeholder="Year Under Review (eg. 2020)"/> -->
                                        </div>
                                    </div>
                                </div>
                                <hr><br>
                                <!-- <input type="button" name="next" class="next action-button" value="Next" /> -->
                                <div class="form-card">
                                    <div class="row">
                                        <div class="col s12 m12 l12 mb-4">
                                            <h5 class="fs-title">Professional Information:</h5>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col s12 m12 l12 input-field mb-4">
                                            <p class="font-weight-bold">List your most significant accomplishments this past year: *</p>
                                            <p><?= $appdata['accomplishments']; ?></p>
                                            <!-- <textarea class="materialize-textarea validate" rows="4" readonly><?= $appdata['accomplishments']; ?></textarea> -->
                                        </div>
                                        <div class="col s12 m12 l12 input-field mb-4">
                                            <p class="font-weight-bold"> List any barriers or challenges that you have: *</p>
                                            <p><?= $appdata['barriers_challenges'] ?></p>
                                            <!-- <textarea class="materialize-textarea validate" rows="4" readonly><?= $appdata['barriers_challenges'] ?></textarea> -->
                                        </div>
                                        <div class="col s12 m12 l12 input-field mb-4">
                                            <p class="font-weight-bold"> How has this barrier(s)/challenge(s) helped you to accomplish your goals: *</p>
                                            <p><?= $appdata['barriers_challenges_goal'] ?></p>
                                            <!-- <textarea class="materialize-textarea validate" rows="4" readonly><?= $appdata['barriers_challenges_goal'] ?></textarea> -->
                                        </div>
                                        <div class="col s12 m12 l12 input-field mb-4">
                                            <p class="font-weight-bold"> Please list your area(s) of strength and area(s) of improvement: *</p>
                                            <p><?= $appdata['strength_improvement'] ?></p>
                                            <!-- <textarea class="materialize-textarea validate" rows="4" readonly><?= $appdata['strength_improvement'] ?></textarea> -->
                                        </div>
                                        <div class="col s12 m12 l12 input-field mb-4">
                                            <p class="font-weight-bold"> What skills or new knowledge would you like to develop to improve your performance?: *</p>
                                            <p><?= $appdata['new_knowledge'] ?></p>
                                            <!-- <textarea class="materialize-textarea validate" rows="4" readonly><?= $appdata['new_knowledge'] ?></textarea> -->
                                        </div>
                                        <div class="col s12 m12 l12 input-field mb-4">
                                            <p class="font-weight-bold"> Is there any other information you would like to share with your supervisor regarding your work performance?: *</p>
                                            <p><?= $appdata['other_information'] ?></p>
                                            <!-- <textarea class="materialize-textarea validate" rows="4" readonly><?= $appdata['other_information'] ?></textarea> -->
                                        </div>
                                    </div>
                                </div>
                                <hr><br>
                                <div class="form-card">
                                    <div class="row">
                                        <div class="col s12 m12 l12 mb-4">
                                            <h5 class="fs-title">Finalization:</h5>
                                        </div>
                                        <div class="col s6 m6 l6 p-5">
                                            <div class="col s12 m12 l12 mb-3">
                                                <p class="font-weight-bold">Supervisor's Name: *</p>
                                                <input type="text" class="form-control-plaintext" readonly placeholder="Supervisors Name" value="<?= $appdata['supervisor_name']; ?>" />
                                            </div>
                                            <div class="m-0 col s12 m12 l12">
                                                <!-- <div class="switch LEFT"> -->
                                                    <label>
                                                        <span>Supervisor Signature</span>
                                                        <?= (!empty($appdata['sup_signed']) ? 'SIGNED' : 'NOT SIGNED') ?>
                                                        <!-- <input type="checkbox" name="sup_signed" disabled id="sup_signed" <?= (!empty($appdata['sup_signed']) ? 'checked' : '') ?> value="Supervisor Signed" />
                                                        <span class="lever"></span> -->
                                                    </label>
                                                <!-- </div> -->
                                            </div>
                                            <!-- <input type="button" name="previous" class="previous action-button-previous" value="Previous" /> -->
                                        </div>
                                        <div class="col s6 m6 l6 p-5">
                                            <div class="col s12 m12 l12 mb-3">
                                                <p class="font-weight-bold" for="employee_name">Employee Name: *</p>
                                                <input type="text" name="employee_name" class="form-control-plaintext" readonly placeholder="Employee Name" value="<?= $appdata['fname'] . ' ' . $appdata['mname'] . ' ' . $appdata['lname']; ?>" />
                                            </div>
                                            <div class="m-0 col s12 m12 l12">
                                                <!-- <div class="switch right"> -->
                                                    <label>
                                                        <span>Employee Signature</span>
                                                        <?= (!empty($appdata['emp_signed']) ? 'SIGNED' : '') ?>
                                                        <!-- <input type="checkbox" name="sup_signed" disabled id="sup_signed" <?= (!empty($appdata['emp_signed']) ? 'checked' : '') ?> value="Supervisor Signed" />
                                                        <span class="lever"></span> -->
                                                    </label>
                                                <!-- </div> -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <br><br>
                                <div class="m-2">
                                    <div class="row clearfix">
                                        <button class="btn no-print waves-effect btn-block waves-light light-blue darken-3" onclick="print()" title="Print Form">
                                            Print
                                        </button>
                                    </div>
                                </div>
                                <!-- <div class="col s12 m12 l12">
                                    <input type="hidden" name="app_self_id" id="app_self_id" value="<?= $appdata['app_self_id'] ?>" />
                                    <?= (($appdata['app_status'] == 2) ? '<button class="btn btn-block d-print-none" onclick="print()" 
                    style="background-color:#d3242c;" style="width:100%;"><i class="zmdi zmdi-print"></i> Print </button>' :
                                        '<button type="submit" name="submit" id="submit" class="btn btn-block" style="background-color:#d3242c;" style="width:100%;"><strong>Submit</strong> </button>') ?>
                                </div> -->
                            </fieldset>
                        </form>
                    <?php else :
                        foreach ($data['staff'] as $staff_data) {
                        } ?>
                        <form id="app_form_a" method="POST">
                            <fieldset>
                                <div class="form-card">
                                    <div class="row">
                                        <div class="col-7">
                                            <h5 class="fs-title">Personal Details:</h5>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="input-field col s4 m4 l4">
                                            <p class="font-weight-bold">Name of Employee: </p>
                                            <input type="fname" name="fname" placeholder="Full Name" class="form-control-plaintext mb-4" readonly value="<?= $staff_data['fname'] . ' ' . $staff_data['mname'] . ' ' . $staff_data['lname']; ?>" />
                                        </div>
                                        <div class="input-field col s4 m4 l4">
                                            <p class="font-weight-bold">Staff No.: </p>
                                            <input type="staff_no" name="staff_no" placeholder="Staff Number" class="form-control-plaintext mb-4" readonly value="<?= $staff_data['staff_no'] ?>" />
                                        </div>
                                        <div class="input-field col s4 m4 l4">
                                            <p class="font-weight-bold">Email:</p>
                                            <input type="email" name="email" placeholder="Email Id" class="form-control-plaintext mb-4" readonly value="<?= $staff_data['ucc_mail'] ?>" />
                                        </div>
                                        <div class="input-field col s4 m4 l4">
                                            <p class="font-weight-bold">Phone No:</p>
                                            <input type="text" name="phoneno" placeholder="Phone Number" class="form-control-plaintext mb-4" readonly value="<?= $staff_data['phone']; ?>" />
                                        </div>
                                        <div class="input-field col s4 m4 l4">
                                            <p class="font-weight-bold">Appointment Data:</p>
                                            <input type="text" name="app_date" placeholder="Appointment Date" class="form-control-plaintext mb-4" readonly value="<?= $staff_data['appoint_date'] ?>" />
                                        </div>
                                        <div class="input-field col s4 m4 l4">
                                            <p class="font-weight-bold">Job Title:</p>
                                            <input type="text" name="Job Title" placeholder="Job Title" class="form-control-plaintext mb-4" readonly value="<?= $staff_data['title'] ?>" />
                                        </div>
                                    </div>
                                    <hr>

                                    <div class="row">
                                        <div class="col s12 m12 l12">
                                            <h5 class="fs-title">Supervisor's Details:
                                                <?php
                                                // var_dump($data);
                                                // die();
                                                ?></h5>
                                        </div>
                                        <div class="input-field col s4 m4 l4">
                                            <p class="supervisor_name">Supervisor's Name: *</p>
                                            <select class="d-block" style="width:100%;" name="supervisor_name" id="supervisor_name">
                                                <option value="">- Select Supervisor's Name -</option>
                                                <?php foreach ($data['userhead'] as $head) { ?>
                                                    <option value="<?= $head['title'] . ' ' . $head['fname'] . ' ' . $head['mname'] . ' ' . $head['lname']; ?>"><?= $head['title'] . ' ' . $head['fname'] . ' ' . $head['mname'] . ' ' . $head['lname']; ?></option>
                                                <?php } ?>
                                            </select>

                                        </div>
                                        <div class="input-field col s4 m4 l4">
                                            <p class="supervisors_rank">Supervisor's Designation/Rank: *</p>
                                            <select class="d-block" style="width:100%;" name="supervisors_rank" id="supervisors_rank">
                                                <option value="">- Select Supervisor's Rank -</option>
                                                <?php foreach ($data['userhead'] as $head) { ?>
                                                    <option value="<?= $head['jobtitle']; ?>"><?= $head['jobtitle']; ?></option>
                                                <?php } ?>
                                            </select>
                                        </div>
                                        <div class="input-field col s4 m4 l4">
                                            <p class="yr_review">Year Under Review: *</p>
                                            <select class="d-block" style="width:100%;" name="yr_review" id="yr_review">
                                                <option value="">- Select Year -</option>
                                                <option value="<?= date("Y") ?>"><?= date("Y") ?></option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <hr><br>
                                <div class="form-card">
                                    <div class="row">
                                        <div class="col-7">
                                            <h5 class="fs-title">Professional Information:</h5>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col s12 m12 l12 input-field mb-4">
                                            <p class="font-weight-bold">List your most significant accomplishments this past year: *</p>
                                            <textarea name="accomplishments" id="accomplishments" class="materialize-textarea validate" placeholder="- Type significant accomplishments here"></textarea>
                                        </div>
                                        <div class="col s12 m12 l12 input-field mb-4">
                                            <p class="font-weight-bold"> List any barriers or challenges that you have: *</p>
                                            <textarea name="barriers_challenges" id="barriers_challenges" class="materialize-textarea validate" placeholder="- Type barriers or challenges that you have"></textarea>
                                        </div>
                                        <div class="col s12 m12 l12 input-field mb-4">
                                            <p class="font-weight-bold"> How has this barrier(s)/challenge(s) helped you to accomplish your goals: *</p>
                                            <textarea name="barriers_challenges_goal" id="barriers_challenges_goal" class="materialize-textarea validate" placeholder="- Type barrier(s)/challenge(s) helped you to accomplish your goals"></textarea>
                                        </div>
                                        <div class="col s12 m12 l12 input-field mb-4">
                                            <p class="font-weight-bold"> Please list your area(s) of strength and area(s) of improvement: *</p>
                                            <textarea name="strength_improvement" id="strength_improvement" class="materialize-textarea validate" placeholder="- List your area(s) of strength and area(s) of improvement"></textarea>
                                        </div>
                                        <div class="col s12 m12 l12 input-field mb-4">
                                            <p class="font-weight-bold"> What skills or new knowledge would you like to develop to improve your performance?: *</p>
                                            <textarea name="new_knowledge" id="new_knowledge" class="materialize-textarea validate" placeholder="- Enter skills or new knowledge would you like to develop (if any)"></textarea>
                                        </div>
                                        <div class="col s12 m12 l12 input-field mb-4">
                                            <p class="font-weight-bold"> Is there any other information you would like to share with your supervisor regarding your work performance?: *</p>
                                            <textarea name="other_information" id="other_information" class="materialize-textarea validate" placeholder="- List other information you would like to share here"></textarea>
                                        </div>
                                    </div>
                                </div>
                                <hr><br>
                                <div class="form-card">
                                    <div class="row">
                                        <div class="col s12 m12 l12">
                                            <h5 class="fs-title">Finalization:</h5>
                                        </div>
                                        <div class="col s6 m6 l6 p-5">
                                            <div class="col s12 m12 l12 mb-3">
                                                <p class="font-weight-bold">Supervisor's Name: *</p>
                                                <input type="text" class="form-control" readonly placeholder="Supervisors Name" />
                                            </div>
                                            <div class="col s6 m6 l6">
                                                <div class="m-0 col s12 m12 l12">
                                                    <div class="switch right">
                                                        <label>
                                                            <span>Supervisor Signature</span>
                                                            <input type="checkbox" name="sup_signed" disabled id="sup_signed" value="Supervisor Signed" />
                                                            <span class="lever"></span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col s6 m6 l6 p-5">
                                            <div class="col s12 m12 l12 mb-3">
                                                <p class="font-weight-bold" for="employee_name">Employee Name: *</p>
                                                <input type="text" name="employee_name" readonly class="form-control" placeholder="Employee Name" value="<?= $staff_data['fname'] . ' ' . $staff_data['mname'] . ' ' . $staff_data['lname']; ?>" />
                                            </div>
                                            <div class="m-0 col s12 m12 l12">
                                                <div class="switch right">
                                                    <label>
                                                        <span>Supervisor Signature</span>
                                                        <input type="checkbox" name="emp_signed" id="emp_signed" value="Employee Signed" />
                                                        <span class="lever"></span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <br><br>
                                <div class="form-card">
                                    <div class="row justify-content-center">
                                        <div class="col s12 m12 l12 text-center">
                                            <h5 class="text-danger text-uppercase text-center">
                                                Please make sure you have provided accurate data before submitting!!!
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col s12 m12 l12">
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
