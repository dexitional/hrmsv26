      <!-- REQUEST FORM -->
     <?php if(isset($action) && $action == 'applyform') { ?>
      <h5 class="theme-cutomizer-title red lighten-4 pt-2 pr-2 pl-2 pb-3 mt-10 circle-rounded white-text text-darken-4 gradient-45deg-indigo-blue box-shadow-none border-round center">REQUEST FORM</h5>
      <ul id="issues-collection" class="collection z-depth-1">
         <li class="collection-item red lighten-5"><h6 class="red-text text-darken-4 center-align"><b><?= $type == 2 ? 'INDIVIDUAL REQUEST':'DEPARTMENTAL REQUEST' ?></b></h6></li>
      </ul>
            
      <form class="mb-5 mt-5" name="applyform" action="postassetreq" method="post">
        <div class="row">
          <div class="input-field col s12">
            <i class="material-icons prefix"></i>
            <select name="request_to_id" required>
              <option value="" disabled selected>-- CHOOSE TARGET UNIT --</option>
              <?php foreach($units as $u){ ?>
              <option value="<?= $u['request_to_id'] ?>"><?= strtoupper($u['request_to']); ?></option>
              <?php }?>
            </select>
            <label>SEND TO</label>
          </div>

          <div class="input-field col s12">
            <i class="material-icons prefix"></i>
            <textarea id="textarea1" name="description" required class="materialize-textarea"></textarea>
            <label for="textarea1">DESCRIPTION </label>
          </div>
          <div class="card-action pl-0 pr-0 center-align">
                <input type="hidden" name="type" value="<?= $type; ?>"/>
                <button class="btn-small waves-effect waves-light light-blue darken-3" id="save-leave"><b>SUBMIT</b></button>
                <button type="button" class="btn-small waves-effect waves-light red darken-3 sidenav-close" style="height:25px;font-size:15px;line-height:10px"><b>X</b></button>
           </div>
      </form>
      <?php } ?>

     <!-- FEEDBACK FORM -->
     <?php if(isset($action) && $action == 'feedbackform') { ?>
      <h5 class="theme-cutomizer-title red lighten-4 pt-2 pr-2 pl-2 pb-3 mt-10 circle-rounded white-text text-darken-4 gradient-45deg-indigo-blue box-shadow-none border-round center">SEND FEEDBACK</h5>
      <form class="mb-5 mt-5" name="feedform" action="postassetfbreq" method="post">
        <div class="row">
          <div class="input-field col s12">
            <i class="material-icons prefix">  </i>
            <select name="remark_id">
              <option value="" disabled selected>Choose your option</option>
              <?php 
                 if(count($remark) > 0){
                  foreach($remarks as $r){ ?>
              <option value="<?= $r['remark_id'] ?>"><?= $m['remark']; ?></option>
              <?php }} ?>
            </select>
            <label>FEEDBACK</label>
          </div>

          <div class="input-field col s12">
            <textarea id="comment" name="comment" class="materialize-textarea"></textarea>
            <label for="comment">COMMENT </label>
          </div>


           <div class="card-action pl-0 pr-0 center-align">
                <button class="btn-small waves-effect waves-light light-blue darken-3" id="save-leave"><b>SUBMIT</b></button>
                <button type="button" class="btn-small waves-effect waves-light red darken-3 sidenav-close" style="height:25px;font-size:15px;line-height:10px"><b>X</b></button>
           </div>
      </form>
    <?php } ?>

     <!-- DETAILS -->
     <?php if(isset($action) && $action == 'detailview') { ?>
 
    <div class="row">
        <div class="col s12 m12 xl12">
          <button type="button" class="btn-small waves-effect waves-light red darken-3 sidenav-close" style="height:25px;font-size:15px;line-height:10px"><b>X</b></button>
          <ul id="issues-collection" class="collection z-depth-1">
              <li class="collection-item red lighten-5"><h6 class="red-text text-darken-4"><b>REQUEST DETAIL</b></h6></li>
              <li class="collection-item light-blue lighten-5"><h6 class="light-blue-text text-darken-4" style="font-size:15px"></h6></li>
              <li class="collection-item">
                  <div class="row">
                    <div class="col s12">
                        <p class="collections-title font-weight-600"><strong>#</strong> ASSIGNED STAFF</p>
                        <p class="collections-content light-blue-text text-darken-3 font-weight-bolder"><?= $data['name'] ?></p>
                    </div>
                  </div>
              </li>

              <li class="collection-item">
                  <div class="row">
                    <div class="col s12">
                        <p class="collections-title font-weight-600"><strong>#</strong> PHONE NUMBER</p>
                        <p class="collections-content light-blue-text text-darken-3 font-weight-bolder"><?= $data['phone'] ?></p>
                    </div>
                  </div>
              </li>
              <li class="collection-item">
                  <div class="row">
                    <div class="col s12">
                        <p class="collections-title font-weight-600"><strong>#</strong> DATE ASSIGNED</p>
                        <p class="collections-content light-blue-text text-darken-3 font-weight-bolder"><?= $data['date_assigned'] ?></p>
                    </div>
                  </div>
              </li>
            
            
            </ul>
        </div>
    </div>

    <?php } ?>


     <!-- DETAILS -->
     <?php if(isset($action) && $action == 'overview') { ?>

        <div class="row">
            <div class="col s12 m12 xl12">
              <button type="button" class="btn-small waves-effect waves-light red darken-3 sidenav-close" style="height:25px;font-size:15px;line-height:10px"><b>X</b></button>
              <ul id="issues-collection" class="collection z-depth-1">
                  <li class="collection-item red lighten-5"><h6 class="red-text text-darken-4"><b>REQUEST OVERVIEW</b></h6></li>
                  <li class="collection-item light-blue lighten-5"><h6 class="light-blue-text text-darken-4" style="font-size:15px"></h6></li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> REQUEST ID</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">EBENEZER KWABENA BLAY ACKAH</p>
                        </div>
                      </div>
                  </li>

                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> REQUEST BY</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">EBENEZER KWABENA BLAY ACKAH</p>
                        </div>
                      </div>
                  </li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> PHONE NUMBER</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">JAN 28, 202O</p>
                        </div>
                      </div>
                  </li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> DEPARTMENT</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">JAN 28, 202O</p>
                        </div>
                      </div>
                  </li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> WORK DESCRIPTION</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">JAN 28, 202O</p>
                        </div>
                      </div>
                  </li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> WORK STATUS</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">JAN 28, 202O</p>
                        </div>
                      </div>
                  </li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> DATE SUBMITTED</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">JAN 28, 202O</p>
                        </div>
                      </div>
                  </li>
                  <li><div class="divider"></div></li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> STAFF ASSSIGNED</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">JAN 28, 202O</p>
                        </div>
                      </div>
                  </li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> DATE ASSSIGNED</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">JAN 28, 202O</p>
                        </div>
                      </div>
                  </li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> DATE STARTED</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">JAN 28, 202O</p>
                        </div>
                      </div>
                  </li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> DATE COMPLETED</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">JAN 28, 202O</p>
                        </div>
                      </div>
                  </li>

                </ul>
            </div>
        </div>

     <?php } ?>
            
    <script src="public/js/main.js"></script>
