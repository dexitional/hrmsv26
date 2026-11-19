<section class="invoice-list-wrapper section">
  <!-- create invoice button-->
  <!-- Options and filter dropdown button-->
  
  <!-- create invoice button-->
  
  
  <div class="responsive-table">
   
  
  <div class="clear"></div>
  
  
  <table class="table invoice-data-table white border-radius-4 pt-1 dataTable dtr-column" id="DataTables_Table_0" role="grid">
      <thead>
        <tr role="row">
            <th class="control sorting_disabled" rowspan="1" colspan="1" style="width: 5px; display: none;" aria-label=""></th>
            <th class="sorting" tabindex="0" aria-controls="DataTables_Table_0" rowspan="1" colspan="1" style="width: 5px;"></th>
            <th class="sorting_asc" tabindex="0" aria-controls="DataTables_Table_0" rowspan="1" colspan="1" style="width: 90px;">
            <span>Notification #</span>
          </th>
          <th>Title</th>
          <th>Date</th>
          <th>Tags</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
       <?php 
            if(count($data) > 0){
              foreach($data as $row){
       ?>
       <tr role="row" class=" <?= $row['read_flag'] == '0' ? 'light-blue lighten-5':'odd'?>">
          <td style="display: none;"></td>
          <td></td>
          <td><a href="#">NID-<?= ($row['id']+1000) ?></a></td>
          <td><small><b><?= strtoupper(empty($row['title']) ? $row['action'] : $row['title']) ?></b></small></td>
          <td><small><?= strtoupper($row['datetime']) ?></small></td>
          <td>
            <span class="bullet cyan"></span>
            <small><?= strtoupper($row['type']) ?></small>
          </td>
          <td><?= $row['read_flag'] == '0' ? '<small class="chip lighten-5 red red-text text-darken-2">UNREAD</small>':'<small class="chip lighten-5 green green-text text-darken-2">READ</small>';?>
           </td>
          <td>
            <div class="invoice-action">
              <a href="<?= $row['id'] ?>" class="invoice-action-view mr-4">
                <i class="material-icons">remove_red_eye</i>
              </a>
            </div>
          </td>
        </tr>
        <?php }}?>
      
      </tbody>
    </table>
</div>
  </div>
</section>