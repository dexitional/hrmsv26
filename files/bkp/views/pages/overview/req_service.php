<?php if (!empty($_SESSION['slim.flash'])): ?>
<script>
document.addEventListener('DOMContentLoaded', function () {

    <?php if (!empty($_SESSION['slim.flash']['success'])): ?>
        M.toast({
            html: '<?= addslashes($_SESSION['slim.flash']['success']); ?>',
            classes: 'green darken-2 white-text',
            displayLength: 4000
        });
    <?php endif; ?>

    <?php if (!empty($_SESSION['slim.flash']['error'])): ?>
        M.toast({
            html: '<?= addslashes($_SESSION['slim.flash']['error']); ?>',
            classes: 'red darken-2 white-text',
            displayLength: 5000
        });
    <?php endif; ?>

});
</script>
<?php endif; ?>
<!-- Staff Profile -->
<div class="row vertical-modern-dashboard">
    <div class="col s12 m12 l12 mt-1">
        <div class="animate fadeRight">
            <div class="card-content pb-1">
                <form class="col s12" action="service_request_script" method="post" name="service_request_script">
                    <div class="row">
                        <div class="col s12">
                            <div class="card">
                                <div class="card-content pb-1">
                                    <h5>REQUEST FOR SUPPORT</h5>
                                    <hr>
                                    <input id="staff_no" name="staff_no" required type="hidden"
                                        value="<?=$_SESSION['user']['staff_no']?>" class="validate">
                                        <div class="row">
                                            <!-- <div class="input-field col s4">
                                                <select class="d-block" style="width:100%;" required name="c_type" id="c_type">
                                                    <option value="" selected disabled>------ Select SERVICE Type ------</option>
                                                    <option value="ICT GENERAL SERVICE">ICT GENERAL SERVICE</option>
                                                </select>
                                                <label for="c_type" class="text-uppercase">Type of SERVICE:</label>
                                            </div> -->
                                            <!-- <div class="input-field col s3">
                                                <input id="contact" name="contact" required type="text" value="" class="validate">
                                                <label for="contact">CONTACT:</label>
                                            </div>
                                            <div class="input-field col s3">
                                                <input id="email" name="email" required type="text"
                                                    value="" class="validate">
                                                <label for="email">EMAIL ADDRESS:</label>
                                            </div> -->
                                            <div class="input-field col s12">
                                                <!-- <input id="email" name="email" required type="text"
                                                    value="" class="validate"> -->
                                                    <textarea name="email" id="email" required class="materialize-textarea" style="min-height:300px; width:100%; border: 1px solid;"></textarea>
                                                <label for="email">TYPE DETAILED DESCRIPTION OF THE ISSUE HERE:</label>
                                            </div>

                                            <div class="input-field col s12">
                                                <!-- <select class="d-block" style="width:100%;" required name="delivery_mode" id="delivery_mode">
                                                    <option value="" selected disabled>------ Select Delivery Mode ------</option>
                                                    <option value="PHONE CALL">PHONE CALL</option>
                                                    <option value="CHATTING">CHATTING</option>
                                                    <option value="FACE TO FACE">FACE TO FACE</option>
                                                    <option value="EMAIL">EMAIL</option>
                                                </select>
                                                
                                                <label for="delivery_mode" class="text-uppercase">Mode of Delivery:</label> -->
                                                <button class="btn waves-effect waves-light light-blue darken-3" id="sub_card_no"><b>SUBMIT</b></button>
                                            </div>
                                        </div>
                                </div>
                                <br>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

</div>