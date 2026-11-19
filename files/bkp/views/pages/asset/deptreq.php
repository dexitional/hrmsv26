<section class="section">
<h5 class="light-blue-text text-darken-4">
  <span>DEPARTMENTAL REQUESTS</span> 
  <button class='btn waves-effect waves-light red darken-4 border-round right  asset_apply' id="asset_apply"  data-sno="<?= $_SESSION['user']['staff_no']?>" data-type="1" >
      <span class="hide-on-small-only">NEW REQUEST</span>
      <i class="material-icons show-on-small right">note_add</i>
</button>
</h5>
  <b>The requests made for the department.</b><div class="divider mt-1"></div>
</section>

<section class="invoice-list-wrapper section">
  
  <div class="responsive-table">
    <table class="table invoice-data-table white border-radius-4 pt-1">
      <thead>     
        <tr>
          <!-- data table responsive icons -->
          <th></th>
          <!-- data table checkbox -->
          <th></th>
          <th><span>REQUEST ID #</span></th>
          <th>UNIT</th>
          <th >DESCRIPTION</th>
          <th >STATUS</th>
          <th colspan="3">ACTION</th>
        </tr>
      </thead>

      <tbody>
      <?php 
            if(count($dep) > 0){
              foreach($dep as $row){
                $rem = $row['remark']['remark_id'];
                $ass =  $row['remark']['assigned_staff_id'];
                $trac =  $row['remark']['tracking_status_id'];
       ?>
        <tr>
          <td></td>
          <td></td>
          <td><a href="#" class="light-blue-text text-darken-3">RID-<?= $row['request_id'] ?></a></td>
          <td><span class="bullet amber"></span> <small><b><?= strtoupper($row['unit']) ?></b></small></td>
          <td><small><em><?= strtoupper($row['description']) ?></em></small></td>
          <td><small class="chip lighten-5 text-darken-2 green green-text"><b><?= strtoupper($row['progress']) ?></b></small></td>
          <td></td>
          <td>
              <div class="invoice-action">
               <?php if($trac == 7){ ?>
                <a href="#" title="View Person Assigned" class="invoice-action-view mr-4 assigned_person" data-id="<?= $row['request_id'] ?>">
                  <i class="material-icons">how_to_reg</i>
                </a>
               <?php }elseif($trac == 8 && $rem == 0){ ?>
                <a href="#" title="Feedback and Comment" class="invoice-action-view mr-4 fb_comment" data-id="<?= $row['request_id'] ?>">
                  <i class="material-icons">feedback</i>
                </a>
               <?php }elseif($trac == 9 && $rem == 0){ ?>
                <a href="#" title="Feedback and Comment" class="invoice-action-view mr-4 fb_comment" data-id="<?= $row['request_id'] ?>">
                  <i class="material-icons">feedback</i>
                </a>
               <?php }elseif($trac == 9 && $rem > 0){ ?>
                <a href="#" title="View Details & Input Work Data" class="invoice-action-view mr-4 rq_overview" data-id="<?= $row['request_id'] ?>">
                  <i class="material-icons">contact_support</i>
                </a>
               <?php } ?>

              </div>

          </td>
          <td>
             <?php if(!true){ ?>
              <div class="invoice-action">
                <a href="#|" class="invoice-action-edit">
                  <i class="material-icons">edit</i>
                </a>
              </div>
             <?php } ?>
          </td>
        </tr>
        <?php }} ?>

      </tbody>
    </table>
  </div>
</section><!-- START RIGHT SIDEBAR NAV -->
