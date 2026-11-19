<!-- Staff Profile -->
<div class="row vertical-modern-dashboard">
    <div class="col s12 m12 l12 mt-1">
        <div class="animate fadeRight">
            <div class="card-content pb-1">
                <form class="col s12" action="counseling_script" method="post" name="counseling_script">
                    <div class="row">
                        <div class="col s12">
                            <div class="card">
                                <div class="card-content pb-1">
                                    <h5>APPLY FOR COUNSELING</h5>
                                    <hr>
                                    <input id="staff_no" name="staff_no" required type="hidden"
                                        value="<?=$_SESSION['user']['staff_no']?>" class="validate">
                                        <div class="row">
                                            <div class="input-field col s3">
                                                <select class="d-block" style="width:100%;" required name="c_type" id="c_type">
                                                    <option value="" selected disabled>------ Select Counseling Type ------</option>
                                                    <option value="ACADEMIC/EDUCATIONAL">ACADEMIC/EDUCATIONAL</option>
                                                    <option value="SOCIAL/PERSONAL">SOCIAL/PERSONAL</option>
                                                    <option value="DEPRESSION/ANXIETY/STRESS">DEPRESSION/ANXIETY/STRESS</option>
                                                    <option value="SEXUAL HARASSMENT/ABUSE">SEXUAL HARASSMENT/ABUSE</option>
                                                    <option value="ANGER MANAGEMENT">ANGER MANAGEMENT</option>
                                                    <option value="RELATIONSHIP ISSUES">RELATIONSHIP ISSUES</option>
                                                    <option value="EFFECTIVE STUDY HABITS">EFFECTIVE STUDY HABITS</option>
                                                    <option value="DECISION AND PROBLEM SOLVING SKILLS">DECISION AND PROBLEM SOLVING SKILLS</option>
                                                    <option value="ADDICTIONS">ADDICTIONS</option>
                                                    <option value="PHOBIAS">PHOBIAS</option>
                                                    <option value="NEGATIVE THINKING PATTERNS">NEGATIVE THINKING PATTERNS</option>
                                                    <option value="SUICIDAL THOUGHTS">SUICIDAL THOUGHTS</option>
                                                    <option value="CAREER CHOICES">CAREER CHOICES</option>
                                                    <option value="OTHERS">OTHERS</option>
                                                </select>
                                                <label for="c_type" class="text-uppercase">Type of Counseling:</label>
                                            </div>
                                            <div class="input-field col s3">
                                                <input id="contact" name="contact" required type="text" value="" class="validate">
                                                <label for="contact">CONTACT:</label>
                                            </div>
                                            <div class="input-field col s3">
                                                <input id="email" name="email" required type="text"
                                                    value="" class="validate">
                                                <label for="email">EMAIL ADDRESS:</label>
                                            </div>

                                            <div class="input-field col s3">
                                                <select class="d-block" style="width:100%;" required name="delivery_mode" id="delivery_mode">
                                                    <option value="" selected disabled>------ Select Delivery Mode ------</option>
                                                    <option value="PHONE CALL">PHONE CALL</option>
                                                    <option value="CHATTING">CHATTING</option>
                                                    <option value="FACE TO FACE">FACE TO FACE</option>
                                                    <option value="EMAIL">EMAIL</option>
                                                </select>
                                                
                                                <label for="delivery_mode" class="text-uppercase">Mode of Delivery:</label>
                                            </div>
                                        </div>
                                    
                                    <button class="btn waves-effect waves-light light-blue darken-3"
                                        id="sub_card_no"><b>SUBMIT</b></button>
                                </div>
                                <br>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div>
                <?php if(!empty($couns_list)):?>
                <div class="row">
                    <div class="col s12">
                        <div class="card">
                            <div class="card-content pb-1">
                                <h5>COUNSELING REQUEST(S) <br><br> <?php //var_dump($couns_list);?></h5>

                                <table class="table invoice-data-table white border-radius-4 pt-1 dataTable" id="DataTables_Table_0" role="grid">
                                    <thead>
                                    <tr role="row">
                                        <th>No.</th>
                                        <th><span>COUNSEL TYPE</span></th>
                                        <th>PHONE NUMBER</th>
                                        <th>EMAIL</th>
                                        <th>DELIVERY MODE</th>
                                        <th>STATUS</th>
                                        <th>COUNSELING FEEDBACK</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <?php 
                                        if(count($couns_list) > 0){
                                            $i=1;
                                            foreach($couns_list as $row){
                                    ?>
                                    <tr>
                                        <td><?=$i++?></td>
                                        <td>
                                            <b class="light-blue-text text-darken-4"><?= $row['council_needed']; ?></b>
                                        </td>
                                        <td>
                                            <b><?= $row['phone_no']; ?></b>
                                        </td>
                                        <td>
                                            <b><?= $row['email']; ?></b><br>
                                        </td>
                                        <td>
                                            <b class="green-text text-darken-4"><?= $row['delivery_mode']; ?></b><br>
                                        </td>
                                        <td><small class="chip lighten-5 text-darken-2 
                                        <?= ($row['status'] == 0 ? 'red red-text ':($row['status'] == 1 ? 'green green-text':($row['status'] == 2 ? 'amber darken-1 black-text':($row['status'] == 3 ? 'black black-text':($row['status'] == 4 ? 'blue blue-text':'amber darken-1 black-text'))))); ?>">
                                        <b><?=($row['status'] == 0?'Pending':($row['status'] == 1?'Assigned':($row['status'] == 2?'Refered':($row['status'] == 3?'Counseling Ongoing':($row['status'] == 4?'Completed':''))))); ?></b></small></td>
                                        
                                        <td>
                                            <?php if($row['status'] > 3):?>
                                            <form act{ion="" method="POST" class="f_feedback">
                                                <!-- <input type="text" value="" name="fid"> -->
                                            <div class="input-field col s12">
                                                <select class="d-block" style="width:100%;" required name="feedback" id="feedback">
                                                    <option value="" selected disabled>------ Select Feedback ------</option>
                                                    <option <?php if($row['feedback'] == "VERY SATISFIED"){ echo "selected"; } ?> value="VERY SATISFIED_<?=$row['id']?>">VERY SATISFIED</option>
                                                    <option <?php if($row['feedback'] == "SATISFIED"){ echo "selected"; } ?> value="SATISFIED_<?=$row['id']?>">SATISFIED</option>
                                                    <option <?php if($row['feedback'] == "SIGHTLY SATISFIED"){ echo "selected"; } ?> value="SIGHTLY SATISFIED_<?=$row['id']?>">SIGHTLY SATISFIED</option>
                                                    <option <?php if($row['feedback'] == "NOT SATISFIED"){ echo "selected"; } ?> value="NOT SATISFIED_<?=$row['id']?>">NOT SATISFIED</option>
                                                    <option <?php if($row['feedback'] == "NOT ATTENDED TO"){ echo "selected"; } ?> value="NOT ATTENDED TO_<?=$row['id']?>">NOT ATTENDED TO</option>
                                                </select>
                                                <label for="feedback" class="text-uppercase">Give us Feedback:</label>
                                            </div>
                                            </form>
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                    <?php 
                                            }}
                                    ?>
                                    
                                    </tbody>
                                </table>
                            </div>
                            <br><br>

                        </div>
                    </div>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

</div>