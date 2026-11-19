<!-- Staff Profile -->
<div class="row vertical-modern-dashboard">
    <div class="col s12 m12 l12 mt-5">
        <div class="animate fadeRight">
            <?php if(empty($nhis_no)):?>
            <div class="card-content pb-1">
                <form class="col s12" action="nhis_update_script" method="post" name="postcard">
                    <div class="row">
                        <div class="col s3"></div>
                        <div class="col s6">
                            <div class="card">
                                <div class="card-content pb-1">
                                    <h5>ENTER NHIS DETAILS</h5>
                                    <hr>
                                    <input id="staff_no" name="staff_no" required type="hidden"
                                        value="<?=$_SESSION['user']['staff_no']?>" class="validate">
                                    <div class="input-field col s12">
                                        <i class="material-icons prefix"> </i>
                                        <input id="nhis_no" name="nhis_no" required type="text" class="validate">
                                        <label for="nhis_no">NHIS NO.</label>
                                    </div>
                                    <button class="btn waves-effect waves-light light-blue darken-3"
                                        id="sub_card_no"><b>SUBMIT</b></button>
                                </div>
                                <br>
                            </div>
                        </div>
                        <div class="col s3"></div>
                    </div>
                </form>
            </div>
            <?php endif; ?>
            <div>
                <?php if(!empty($nhis_no)):?>
                <div class="row">
                    <div class="col s3"></div>
                    <div class="col s6">
                        <div class="card">
                            <div class="card-content pb-1">
                                <h5>NHIS NUMBER: <?=strtoupper($nhis_no);?></h5>
                                <?php if(!empty($nhis_expire_date)): ?>
                                <h5>NHIS EXPIRY DATE: <?=$nhis_expire_date;?></h5>
                                <?php else: ?>
                                <!-- <h5>NHIS EXPIRY DATE: NOT SET</h5> -->
                                <?php endif; ?>
                            </div>
                            <br><br>

                        </div>
                    </div>
                    <div class="col s3"></div>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

</div>