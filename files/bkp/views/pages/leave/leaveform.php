      <!-- CREATE & UPDATE FORM -->
      <h5 class="theme-cutomizer-title red lighten-4 pt-2 pr-2 pl-2 pb-3 mt-10 circle-rounded white-text text-darken-4 gradient-45deg-indigo-blue box-shadow-none border-round center">LEAVE APPLICATION</h5>
      
      <?php if(isset($action) && $action == 'applyform') { ?>
      
      <ul class="collection z-depth-1">
         <li class="collection-item red lighten-5"><h6 class="red-text text-darken-4"><b><?= $data['title'] ?> LEAVE</b></h6></li>
         <li class="collection-item light-blue lighten-5"><h6 class="light-blue-text text-darken-4" style="font-size:15px"><?= $st['name'].' <em>- '.$st['staff_no'].' </em>';?></h6></li>
         <li class="collection-item"><h6 style="font-size:15px"><b>LEAVE ENTITLEMENT : <?= $data['ent'] ?> DAYS</b></h6></li>
      </ul>
               
      <form class="mb-5 mt-5" name="applyleave" action="postleave" method="post">
        <div class="row">
        
          
          <div class="input-field col s12">
            <i class="material-icons prefix">  </i>
            <input id="approved_days" name="approved_days" required type="number" min="0" max="<?= $data['ent'] ?>" class="validate">
            <label for="approved_days">LEAVE DAYS TO BE TAKEN</label>
          </div>

          <div class="input-field col s12">
            <i class="material-icons prefix">  </i>
            <input  type="date" name="start_date" required onclick="date_acc_change()"  class="validate" id="start_date">
            <label for="start_date">EXPECTED START DATE</label>
          </div>

          
          <div class="input-field col s12">
            <i class="material-icons prefix">  </i>
            <input id="business" name="emergency_note" required type="text" class="validate">
            <label for="business">EMERGENCY NAME & ADDRESS</label>
          </div>
        </div>

        <div class="row">
          <div class="input-field col s12">
            <i class="material-icons prefix">  </i>
            <input id="emergency_contact" type="tel" required name="emergency_contact" maxlength="10" class="validate">
            <label for="emergency_contact">EMERGENCY CONTACT ( PHONE )</label>
          </div>
         
           <div class="card-action pl-0 pr-0 center-align">
                <button class="btn-small waves-effect waves-light light-blue darken-3" id="save-leave"><b>SUBMIT</b></button>
                <button type="button" class="btn-small waves-effect waves-light red darken-3 sidenav-close" style="height:25px;font-size:15px;line-height:10px"><b>X</b></button>
                <input type="hidden" name="entitlement" value="<?= $data['ent'] ?>"/>
                <input type="hidden" name="typeid" value="<?= $data['typeid'] ?>"/>
                <input type="hidden" name="group" value="<?= $data['group'] ?>"/>
                <input type="hidden" name="sno" value="<?= $data['sno'] ?>"/>
           </div>
      </form>
      <?php } ?>

      <!-- RECORD VIEW -->
     

     <!-- LEAVE CHOOSER -->
     <?php if(isset($action) && $action == 'choose') { ?>

     <div class="row">
     <div class="col s12 m12 xl12">
        <button type="button" class="btn-small waves-effect waves-light red darken-3 sidenav-close" style="height:25px;font-size:15px;line-height:10px"><b>X</b></button>
        <ul id="issues-collection" class="collection z-depth-1">
            <li class="collection-item red lighten-5"><h6 class="red-text text-darken-4"><b>LEAVE OPTIONS</b></h6></li>
            <li class="collection-item light-blue lighten-5"><h6 class="light-blue-text text-darken-4" style="font-size:15px"><?= $st['name'].' <em>- '.$st['staff_no'].'</em>';?></h6></li>
            <?php 
               if(count($data) > 0){
                   foreach($data as $row){
            ?>
            <li class="collection-item">
               <div class="row">
                  <div class="col s7">
                     <p class="collections-title font-weight-600"><strong>#</strong> <?= $row['title'] ?> LEAVE</p>
                     <p class="collections-content light-blue-text text-darken-3 font-weight-bolder"><?= $row['data']['due'] ?> DAYS</p>
                  </div>
                  <div class="col s5">
                     <div class="progress">
                        <div class="determinate" style="width:   <?= ((($row['data']['entitlement']+$row['data']['balance']) - $row['data']['due']) / ($row['data']['entitlement']+$row['data']['balance'])) * 100 ?>%"></div>
                     </div>
                     <button class="waves-effect waves-light light-blue darken-3 btn-small mr-2 lapply_btn" id="lapply_btn"  data-typeid="<?= $row['typeid'] ?>" data-entitlement="<?= $row['data']['due'] ?>" data-sno="<?= $row['sno'] ?>" data-title="<?= $row['title'] ?>" data-group="<?= $row['group'] ?>">APPLY</button>
                  </div>
               </div>
            </li>
            <?php }}else{ ?>

            <li class="collection-item">
               <div class="row">
                  <div class="col s12">
                     <p class="collections-title font-weight-600"><strong><em>You can't apply for leave</em></strong></p>
                  </div>
               </div>
            </li>

            <?php } ?>
            
          
         </ul>
      </div>
    </div>

    <?php } ?>
 
    <script src="public/js/main.js"></script>
<script type="text/javascript">
  function date_acc_change(){
    var assign_check = document.getElementById('start_date').value;
    var date = new Date();
    var assign_check = new Date(assign_check);
    var Difference_In_Time = assign_check.getTime() - date.getTime();
    if(Difference_In_Time < 10){
      alert("Please you have to give at least 10days notice before leave date");
    document.getElementById('start_date').value = '';
    }

  }
</script>