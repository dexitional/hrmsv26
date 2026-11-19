<!-- Staff Profile -->
<div class="row vertical-modern-dashboard">
    <div class="col s12 m12 l12 mt-5">
        <div class="animate fadeRight">
            <div class="card-content pb-1">
                <form class="col s12" action="ghcard_update_script" method="post" name="postcard">
                    <div class="row">
                        <div class="col s3"></div>
                        <div class="col s6">
                            <div class="card">
                                <div class="card-content pb-1">
                                    <h5>ENTER GHANA CARD DETAILS</h5>
                                    <hr>
                                    <input id="staff_no" name="staff_no" required type="hidden"
                                        value="<?=$_SESSION['user']['staff_no']?>" class="validate">
                                    <div class="input-field col s12">
                                        <i class="material-icons prefix"> </i>
                                        <input id="ghcard_no" name="ghcard_no" required type="text" class="validate">
                                        <label for="ghcard_no">GHANA CARD NO.</label>
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
            <div>
                <?php if(!empty($ghana_card_no)):?>
                <div class="row">
                    <div class="col s3"></div>
                    <div class="col s6">
                        <div class="card">
                            <div class="card-content pb-1">
                                <h5>GHANA CARD NUMBER <br><br> <?=strtoupper($ghana_card_no);?></h5>
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