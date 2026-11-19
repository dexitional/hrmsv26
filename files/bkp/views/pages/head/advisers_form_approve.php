<?php
      //var_dump($row_sdata);
      //echo $row_sdata['staff_no']; die();
      ?>
      <!-- CREATE & UPDATE FORM -->
      <style>
        select {
          display: block !important;
        }
      </style>
      <h5 class="theme-cutomizer-title red lighten-4 pt-2 pr-2 pl-2 pb-3 mt-10 circle-rounded white-text text-darken-4 gradient-45deg-indigo-blue box-shadow-none border-round center">ACADEMIC ADVISERS</h5>

      <form class="mb-5 mt-5" name="endorse_adviser_approve" action="endorse_adviser_approve" method="post">
        <div class="row ">
          <div class="input-field col s12">

          </div>
          <?= 'STAFF NAME : ' . $row_sdata['name']; ?>
          <?php if ($st_advice) {
            echo '<br> LEVEL: ' . $st_advice['level_ass'];
            // echo '<br> LEVEL: ' . $st_advice['progid'];
            echo '<br> PROGRAM: ' . $st_advice['long_name'];
          }
          ?>

          <div class="card hoverable animate fadeLeft">
            <div class="card-content">
              <ul class="collection">
                <li class="collection-item">
                  <h6><b>APPROVAL FORM</b></h6>
                </li>
              </ul>
            </div>
          </div>
          <!-- <label for="level_ass">ASSIGN LEVEL:</label> -->
          <div class="input-field col s12">
            <i class="material-icons prefix"> </i>
            <select name="status" id="status">
              <option value="" selected disabled>------ Select Action ------
              </option>
              <option value="2">APPROVE</option>
              <option value="3">DISAPPROVE</option>
            </select>
          </div>
          <br><br><br>
          <div class="card-action pl-0 pr-0 center-align">
            <?php
            $date = date('Y');
            $newDate = date('Y', strtotime($date . ' + 1 years'));
            ?>
            <button class="btn-small waves-effect waves-light btn" id="save-leave"><b>APPROVE</b></button>
            <button type="button" class="btn-small waves-effect waves-light red darken-3 sidenav-close" style="height:25px;font-size:15px;line-height:10px"><b>X</b></button>
            <input type="hidden" name="unit_id" value="<?= $row_sdata['unit_id'] ?>" />
            <input type="hidden" name="sno" value="<?= $row_sdata['staff_no'] ?>" />
            <input type="hidden" name="activity" value="VC-APPROVED" />
            <input type="hidden" name="academic_yr" value="<?= date('Y') . '/' . $newDate; ?>" />
            <input type="hidden" name="level_ass" value="<?php echo $st_advice['level_ass'] ?>" />
            <input type="hidden" name="progid" value="<?php echo $st_advice['progid'] ?>" />
            <input type="hidden" name="acc_id" value="<?php echo $st_advice['id'] ?>" />
            <input type="hidden" name="approved" value="0" />
            <input type="hidden" name="stage_status" value="0" />
            <!-- <input type="hidden" name="status" value="2" /> -->
          </div>
          <?php //else : 
          ?>
          <!-- <div class="card hoverable animate fadeLeft">
              <div class="card-content">
                <ul class="collection">
                  <li class="collection-item">
                    <p><b>APPLIED, AWAITING APPROVAL</b></p>
                  </li>
                </ul>
              </div>
            </div> -->
          <?php //endif; 
          ?>
        </div>

      </form>




      <!-- RECORD VIEW -->


      <!-- </div> -->

      <script src="../../public/js/main.js"></script>