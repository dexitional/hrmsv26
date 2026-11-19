<!-- Staff Profile -->
<?php
// echo $stdata_promo[0]['status'];
// echo 'pal';
// die();

?>
<style>
    @media print {
        footer {
            page-break-after: always;
        }
    }
</style>
<?php //if ($stdata_promo[0]['status'] > 0 && $stdata_promo[0]['status'] != 7) : ?>
    <div class="m-2">
        <div class="row clearfix">
            <button class="btn no-print waves-effect btn-block waves-light light-blue darken-3" onclick="print()" title="Print Form">
                Print
            </button>
        </div>
    </div>
    <div class="card-content pb-1">
        <div style="text-align:center;">
            <p><b>UNIVERSITY OF CAPE COAST</b></p>
            <h5><u>APPLICATION FOR PROMOTION</u></h5>
            <p><b><u>SENIOR MEMBERS - <?= (($_SESSION['user']['staff_type'] == "ACADEMIC") ? 'TEACHING' : 'NON-TEACHING') ?></u></b></p>
            <br>
        </div>
        <p>This Form is to be completed and <u>a copy</u> should be submitted to the Head of your <b>Department</b>.</u> A <b>Soft-copy</b> of your Publications & C.V., etc.
            should be added when forwarding the Application.
        </p>
        <br>
        <input type="hidden" name="apply_type" id="apply_type" value='0'>
        <div class="row">
            <div class="col s12">
                <p>
                    APPLICATION FOR PROMOTION TO THE RANK OF:
                    <?= $stdata[0]['position_applied'] ?>
                </p>
            </div>
            <div class="col s12 text-uppercase">
                <p><b> Type of Promotion: </b> <?= $stdata_promo[0]['promo_comments'] ?></p>
            </div>
            <div class="col s12 text-uppercase">
                <p><b>Department:</b> <?= $stdata[0]['deptname'] ?></p>
            </div>
            <div class="col s12 text-uppercase">
                <p><b>College/ Directorate:</b> <?= $stdata[0]['collegename'] ?></p>
            </div>
            <?php if ($_SESSION['user']['staff_type'] == "ACADEMIC") : ?>
                <div class="text-uppercase col s12">
                    <p><b>AREAS OF SPECIALIZATION:</b> <?= $stdata_promo[0]['area_specialization'] ?></p>
                </div>
            <?php endif; ?>
        </div>
        <div class="row">
            <div class="text-uppercase col s6">
                <p><b>EMAIL ADDRESS:</b> <?= $stdata[0]['ucc_mail'] ?></p>
            </div>
            <div class="text-uppercase col s6">
                <p><b>TELEPHONE:</b> <?= $stdata[0]['phone'] ?></p>
            </div>
        </div>
        <div class="row">
            <div class="text-uppercase col s6">
                <p><b>PRESENT RANK <?= (($_SESSION['user']['staff_type'] == "ACADEMIC") ? 'HELD' : '') ?>:</b> <?= $stdata_promo[0]['present_rank'] ?></p>
            </div>
            <div class="text-uppercase col s6">
                <p><b>EFFECTIVE DATE: </b> <?= $stdata_promo[0]['pr_edate'] ?></p>
            </div>
        </div>
        <div class="row">
            <div class="text-uppercase col s6">
                <p><b>PRESENT POSITION HELD (IF ANY):</b> <?= $stdata_promo[0]['present_rank_ifany'] ?></p>
            </div>
            <div class="text-uppercase col s6">
                <p><b>EFFECTIVE DATE:</b> <?= $stdata_promo[0]['pp_edate'] ?></p>
            </div>
        </div>
        <div class="row">
            <div class="text-uppercase col s12">
                <p><b>DETAILS OF FIRST DEGREES (STATE WHEN AND WHERE OBTAINED, CLASS AND/OR SPECIAL DISTINCTIONS):
                    </b> <br><?= $stdata_promo[0]['first_degree_details'] ?></p>
            </div>
            <div class="text-uppercase col s12">
                <p><b>Details of Post Graduate
                        Degrees (state when and where obtained, class and/or special distinctions (if
                        any)):</b> <br> <?= $stdata_promo[0]['pg_degree_details'] ?></p>
            </div>
            <?php if ($_SESSION['user']['staff_type'] == "ACADEMIC") : ?>
                <div class="text-uppercase col s12">
                    <p><b>Other Qualifications with
                            Dates; (state when and where obtained):</b> <br>
                        <?= $stdata_promo[0]['other_qualification'] ?>
                    </p>
                </div>
            <?php endif; ?>

            <div class="text-uppercase col s12">
                <p><b>Prizes, Travel Grants and
                        Awards; with Dates:</b> <br>
                    <?= $stdata_promo[0]['prizes_grant_award'] ?>
                </p>
            </div>
            <div class="text-uppercase col s12">
                <p><b><?= (($_SESSION['user']['staff_type'] == "ACADEMIC") ? 'Previous Posts and Duties held, with Dates' :
                            'Previous Posts and Duties held, with Dates, before joining the University') ?>:</b> <br>
                    <?= $stdata_promo[0]['previous_post_duties'] ?>
                </p>

            </div>
            <?php if ($_SESSION['user']['staff_type'] == "ACADEMIC") : ?>
                <div class="text-uppercase col s12">
                    <p><b>Details of Research or
                            Major Projects undertaken; with Dates:</b> <br>
                        <?= $stdata_promo[0]['research_major_projects'] ?>
                    </p>
                </div>
            <?php endif; ?>
            <div class="text-uppercase col s12">
                <p><b><?= (($_SESSION['user']['staff_type'] == "ACADEMIC") ? 'Details of Teaching Experience in a University of equivalent level' : 'Posts and Duties with Dates, held in this University') ?>:
                    </b> <br>
                    <?= $stdata_promo[0]['teaching_duties_experience'] ?>
                </p>

            </div>
            <div class="text-uppercase col s12">
                <p><b><?= (($_SESSION['user']['staff_type'] == "ACADEMIC") ? 'Conferences, Seminars, Symposia, Workshops, etc., attended by Applicant - (give details of Papers presented)' :
                            'Particulars of Conferences; Special Seminars, and Workshops in which you have participated. (Please list Papers you read (if any))') ?>:
                    </b> <br>
                    <?= $stdata_promo[0]['conference_seminars_etc'] ?>
                </p>

            </div>
            <div class="text-uppercase col s12">
                <p><b>Publications
                        submitted in support of Previous Application for Promotion. Give details of
                        Books and Articles and state exact references: </b><br>
                    <?= $stdata_promo[0]['publications_for_previous_promotion'] ?>
                </p>

            </div>
            <div class="text-uppercase col s12">
                <p><b>Publications submitted
                        in support of Current application for Promotion. Give details of Books and
                        Articles and state exact references. Copies of Articles and other Publications
                        (where possible) should accompany the Application: </b><br>
                    <?= $stdata_promo[0]['new_publication_submitted'] ?>
                </p>
            </div>
            <div class="text-uppercase col s12">
                <p><b>Membership of
                        Professional / Learned Bodies: </b>
                    <?= $stdata_promo[0]['professional_membership_bodies'] ?>
                </p>
            </div>
            <div class="text-uppercase col s12">
                <p><b>Any other relevant
                        information (Public Service, College or National Committees, etc., on which you
                        have served) with dates: </b><br>
                    <?= $stdata_promo[0]['other_relevant_info'] ?>
                </p>
            </div>


            <div class="text-uppercase col s6">
                <p><b>Name of Applicant (in full): </b> <?= $stdata_promo[0]['fullname'] ?></p>
            </div>
            <div class="text-uppercase col s6">
                <p><b>Staff No.: </b> <?= $stdata_promo[0]['staff_no'] ?></p>
            </div>
            <?php if (empty($stdata_promo[0]['signature'])) : ?>
            <?php else : ?>
                <div class="col s6">
                    <!-- <div class="row"> -->
                    <!-- <div class="col s12"> -->
                    <img src="<?= $stdata_promo[0]['signature'] ?>" alt="Signature" width="100" height="auto">
                    <!-- </div> -->
                    <!-- </div> -->
                </div>
            <?php endif; ?>
            <div class="text-uppercase col s6">
                <p><b>DATE: </b> <?= $stdata_promo[0]['sub_date'] ?></p>
            </div>
        </div>
    </div>
<?php //endif; ?>