<style>
.card .card-content {
    padding: 24px;
    overflow: scroll;
}

.action-filters {
    -webkit-box-flex: .95;
    -webkit-flex-grow: .95;
    -ms-flex-positive: .95;
    flex-grow: .95;
}
#main .section-data-tables .dataTables_wrapper .dataTables_filter, #main .section-data-tables .dataTables_wrapper .dataTables_length{ 
  display:block;
  width: 100%;
  padding-right: 30px;
  border-bottom: 2px dashed #ccc;
}
.dataTables_filter label input[type=search] {
    height: 3.2rem;
    margin: 0 0 15px;
    padding-left: 1.5rem;
    border: 1px solid #9e9e9e!important;
    border-bottom: none;
    border-radius: 150px;
    background: #f1f2f3;
}
.dataTables_filter label {
    position: relative;
    
}

.dataTables_filter label:after {
    content:'';
}
</style>
<div class="section section-data-tables">
 
  <div class="row">
    <div class="col s12 m12 l12">
      <div id="button-trigger2" class="card card card-default scrollspy">
        <div class="card-content">
          <h4 class="card-title">UNIVERSITY CIRCULARS & NOTICES</h4>
          <div class="row">
            <div class="col s12">
              <p>All Notices and circulars organised for your perusal.</p>
            </div><br><br>
            <div class="col s12">
              <div>
                <table id="row-group-tbl-circular" class="display">
                <thead>
                  <tr role="row">
                      <th>&nbsp;</th>
                      <th><b>SUBJECT</b></th>
                      <th><b>POSTED ON</b></th>
                      <th><b>REFERENCE NO.</b></th>
                      <th><b>RECEIVER</b></th>
                      <th><b>PDF FILE</b></th>
                  </tr>
                </thead>
                <tbody>
                    <?php 
                            if(count($data) > 0){
                              foreach($data as $row){
                    ?>    
                    <tr>
                        <td>
                          <img src="public/images/notice.png" style="height:40px;display:block;margin:0 auto;border-radius:50%"/>
                        </td>
                        <td><strong><?= $row['subject'] ?></strong></td>
                        <td><?= $row['created_at'] ?></td>
                        <td><b style="font-weight:bolder;"><?= $row['letter_no'] ?></b></td>
                        <td><b><?= $row['copied'] ?></b></td>
                        <td>
                          <a class="btn-floating waves-effect waves-light red" target="_blank" href="public/images/doc/<?=basename($row['attachment']); ?>"><i class="material-icons">picture_as_pdf</i></a>
                          <!-- <a class="btn-floating waves-effect waves-light red" target="_blank" href="public/vendors/pdfjs/web/viewer.html?file=<?= $row['attachment']; ?>"><i class="material-icons">picture_as_pdf</i></a> -->
                        </td>
                        
                    </tr>
                    <?php }} ?>
                   
               </tbody>
             </table>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  

  

  

  
</div>