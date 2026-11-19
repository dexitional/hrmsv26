<?php $headtype = isset($_SESSION['headtype']) ? $_SESSION['headtype'] : (isset($_SESSION['user']['type']) ? $_SESSION['user']['type'] : ''); ?>
<h5 class="theme-cutomizer-title red lighten-4 pt-2 pr-2 pl-2 pb-3 mt-10 circle-rounded white-text text-darken-4 gradient-45deg-indigo-blue box-shadow-none border-round center">Approve/Disapprove</h5>


<div role="tabpanel" class="tab-pane">
    <ul>
        <?php if (!empty($pos_sql)) {
            foreach ($pos_sql as $sqlprocure) {
            }


        ?>
            <section class="gradient-custom-5">
                <form method="POST" class="procureapprovaldd" action="procure_aproval">
                    <input type="hidden" name="promo_id" id="promo_id" value="<?= $sqlprocure['request_id']; ?>">
                    <?php if (isset($_SESSION['uhead']) && $_SESSION['uhead'] == '02') { ?>
                        <input type="hidden" name="promo_stage" id="promo_stage" value="<?= ($headtype == 'ACADEMIC') ? '2' : '3' ?>,1">
                    <?php } elseif (isset($_SESSION['uhead']) && $_SESSION['uhead'] == '01') { ?>
                        <input type="hidden" name="promo_stage" id="promo_stage" value="<?= ($headtype == 'ACADEMIC') ? '3' : '3' ?>,2">
                    <?php } ?>
                    <input type="hidden" name="apply_type" id="apply_type" value='0'>
                    <div class="clearfix">

                        <div class="row">
                            <div class="switch right col s6">
                                <label>
                                    <span style="font-size:15px;">Disapprove</span>
                                    <input type="checkbox" value="2" name="radio" id="radio2" />
                                    <span class="lever"></span>
                                </label>
                            </div>
                            <div class="switch right col s6">
                                <label>
                                    <span style="font-size:15px;">Approve</span>
                                    <input type="checkbox" value="1" name="radio" id="radio1" />
                                    <span class="lever"></span>
                                </label>
                            </div>
                        </div>
                        <br><br>
                        <div class="col m12 col l12 col s12 mb-4">
                            <div class="form-group">
                                <label for="comment" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Type a Comment</strong></label>
                                <textarea name="comment" id="comment" rows="40" col="20" class="materialize-textarea validate" placeholder="Type a comment here..."></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="row mb-4">
                        <div class="col m12 col l12 col s12 mx-auto">
                            <button class="btn btn-block font-weight-bold gradient-shadow gradient-45deg-indigo-blue box-shadow-none btn-round" type="submit" name="approve" id="approve">
                                Submit</button>
                        </div>
                        <!-- <div class="col m6 col l6 col s6 mx-auto">
                            <button class="btn waves-effect btn-block waves-light darken-3" style="background-color: #dc3545;" type="button" data-dismiss="modal" aria-label="Close">
                                Cancel</button>
                        </div> -->
                    </div>

                </form>

            </section>
        <?php

            //}
        } ?>
    </ul>
</div>