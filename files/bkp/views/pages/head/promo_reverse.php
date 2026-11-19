<h5 class="theme-cutomizer-title red lighten-4 pt-2 pr-2 pl-2 pb-3 mt-10 circle-rounded white-text text-darken-4 gradient-45deg-indigo-blue box-shadow-none border-round center">Reverse Form To Applicant</h5>


<div role="tabpanel" class="tab-pane">
    <section class="gradient-custom-5">
        <h5>Reverse Application to Applicant for Files Update</h5>
        <form method="POST" class="uploadfilereturn" action="promo_return_new">
            <input type="hidden" name="promo_id" value="<?= $sid; ?>" id="promo_id">
            <input type="hidden" name="promo_stage" value="<?= $promo_id; ?>" id="promo_stage">
            <input type="hidden" name="apply_type" id="apply_type" value='0'>
            <div class="clearfix">
                <div class="funkyradio row">
                    <!-- <div class="col s12">
                        <b>Which file should applicant resend?
                        </b>
                    </div> -->
                    <table>
                        <tbody>
                            <!-- <tr>
                                <th>
                                    <span for="radio3" style="font-size:15px;">Curriculum Vitae (CV)</span>
                                </th>
                                <td>
                                    <div class="switch">
                                        <label>
                                            <input type="checkbox" name="radio" class="radio" id="radio3" value="8" />
                                            <span class="lever"></span>
                                        </label>

                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th>
                                    <span for="radio3" style="font-size:15px;">Papers</span>
                                </th>
                                <td>
                                    <div class="switch">
                                        <label>

                                            <input type="checkbox" name="radio" class="radio" id="radio4" value="9" />
                                            <span class="lever"></span>
                                        </label>

                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th>
                                    <span for="radio6" style="font-size:15px;">Application Form</span>
                                </th>
                                <td>
                                    <div class="switch">
                                        <label>

                                            <input type="checkbox" name="radio" class="radio" id="radio6" value="11" />
                                            <span class="lever"></span>
                                        </label>

                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th>
                                    <span for="radio5" style="font-size:15px;">CV, Papers and Application Form</span>
                                </th>
                                <td>
                                    <div class="switch">
                                        <label>

                                            <input type="checkbox" name="radio" class="radio" id="radio5" value="10" />
                                            <span class="lever"></span>
                                        </label>

                                    </div>
                                </td>
                            </tr> -->
                            <?php if($_SESSION['uhead'] == 3): ?>
                                <tr>
                                    <th>
                                        <span for="radio6" style="font-size:15px;">Reverse to Applicant</span>
                                    </th>
                                    <td>
                                        <div class="switch">
                                            <label>

                                                <input type="checkbox" name="radio" class="radio" id="radio8" value="10" />
                                                <span class="lever"></span>
                                            </label>

                                        </div>
                                    </td>
                                </tr>
                            <?php elseif($_SESSION['uhead'] == 2): ?>
                                <tr>
                                    <th>
                                        <span for="radio6" style="font-size:15px;">Reverse to HOD and Applicant</span>
                                    </th>
                                    <td>
                                        <div class="switch">
                                            <label>

                                                <input type="checkbox" name="radio" class="radio" id="radio6" value="13" />
                                                <span class="lever"></span>
                                            </label>

                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>
                                        <span for="radio6" style="font-size:15px;">Reverse to HOD</span>
                                    </th>
                                    <td>
                                        <div class="switch">
                                            <label>

                                                <input type="checkbox" name="radio" class="radio" id="radio7" value="14" />
                                                <span class="lever"></span>
                                            </label>

                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>
                                        <span for="radio6" style="font-size:15px;">Reverse to Applicant</span>
                                    </th>
                                    <td>
                                        <div class="switch">
                                            <label>

                                                <input type="checkbox" name="radio" class="radio" id="radio8" value="10" />
                                                <span class="lever"></span>
                                            </label>

                                        </div>
                                    </td>
                                </tr>
                            <?php elseif($_SESSION['uhead'] == 1): ?>
                                <tr>
                                    <th>
                                        <span for="radio6" style="font-size:15px;">Reverse to Dean and Applicant</span>
                                    </th>
                                    <td>
                                        <div class="switch">
                                            <label>

                                                <input type="checkbox" name="radio" class="radio" id="radio6" value="13" />
                                                <span class="lever"></span>
                                            </label>

                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>
                                        <span for="radio6" style="font-size:15px;">Reverse to Dean</span>
                                    </th>
                                    <td>
                                        <div class="switch">
                                            <label>

                                                <input type="checkbox" name="radio" class="radio" id="radio7" value="14" />
                                                <span class="lever"></span>
                                            </label>

                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>
                                        <span for="radio6" style="font-size:15px;">Reverse to Applicant</span>
                                    </th>
                                    <td>
                                        <div class="switch">
                                            <label>

                                                <input type="checkbox" name="radio" class="radio" id="radio8" value="10" />
                                                <span class="lever"></span>
                                            </label>

                                        </div>
                                    </td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>

                </div>
                <br><br>
                <div class="col s12 mb-4">
                    <div class="form-group">
                        <label for="comment1" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Give a Comment/Reason </strong></label>
                        <textarea name="comment1" id="comment1" rows="40" col="20" required class="materialize-textarea validate" placeholder="Type a comment here..."></textarea>
                    </div>
                </div>
            </div>
            <div class="row mb-4">
                <div class="col s12">
                    <button class="btn btn-block font-weight-bold gradient-shadow gradient-45deg-indigo-blue box-shadow-none btn-round" type="submit" name="approve" id="approve">
                        Submit</button>
                </div>

            </div>
</div>

</form>
</section>
</div>