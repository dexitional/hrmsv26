<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
<script src="https://cdn.tailwindcss.com"></script>

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

  #main .section-data-tables .dataTables_wrapper .dataTables_filter,
  #main .section-data-tables .dataTables_wrapper .dataTables_length {
    display: block;
    width: 100%;
    padding-right: 30px;
    border-bottom: 2px dashed #ccc;
  }

  .dataTables_filter label input[type=search] {
    height: 3.2rem;
    margin: 0 0 15px;
    padding-left: 1.5rem;
    border: 1px solid #9e9e9e !important;
    border-bottom: none;
    border-radius: 150px;
    background: #f1f2f3;
  }

  .dataTables_filter label {
    position: relative;

  }

  .dataTables_filter label:after {
    content: '';
  }

   /* Additional styles for modal visibility */
   .modal {
            display: none;
        }
        .modal-active {
            display: flex;
        }
</style>
<a?php //var_dump($_SESSION['advisers']);
?>
<div class="section section-data-tables"  x-data="{ open: false }">
  

  <div class="row">
    <div class="col s12 m12 l12">
      <div id="button-trigger2" class="card card card-default scrollspy">
        <div class="card-content">
          <h4 class="card-title uppercase">Operational Plan per department</h4>
          <div class="row">
            <div class="col s12">
              <p>View all Operational Plans for departments under you</p>
            </div><br><br>
            <div class="col s12">
              <div class="responsive-table">
                <!-- <table class="table invoice-data-table white border-radius-4 pt-1"> -->
                <!-- <table class="table table-striped table-hover table-border table-sm"> -->
                <table id="row-group-tbl-procure" class="display">
                  <thead>
                    <tr role="row">
                      <th class="text-uppercase"><b>Department Name</b></th>
                      <th class="text-uppercase"><b>Short Name</b></th>
                      
                      <th class="text-uppercase"><b>action</b></th>
            

                    </tr>
                  </thead>
                  <tbody>
                    <?php
                    if (count($data) > 0) {
                      foreach ($data as $row) {
                    ?>
                        <tr>
                          <td><b><?= $row['long_name'] ?></b><br>
                          
                              
                            </td>
                            <td><b><?= $row['short_name'] ?></b><br>
                          
                              
                          </td>
                          <td> 
                          <a href='#' data-original-title="Take Action" title="View List" class='btn waves-effect waves-light chip lighten-5 text-darken-2 blue green-text mr-1 mb-1 right check_list' data-sno="<?= $row['id'] ?>" data-id="<?php echo $promo['id']; ?>" data-entry="<?= $row['sources_mean'] . ',' . $row['status']; ?>">
                                                            <i class="material-icons">list</i>
                                                            <!-- <i class="fas fa-list me-1"></i> -->
                                                        </a>
                                                      
                                                      
                                                      </td>


                        </tr>
                    <?php }
                    } ?>

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
<!-- <script>
   $('#row-group-tbl-opt_plan tbody').on('click','.view_list',function(){ 
            // $('.hod_make_advicer').on('click',function(){
            const sno = $(this).data('sno');
            //const entry = $(this).data('entry');
            const loader = `
                   <div class="preloader-wrapper">
                       <div class="spinner-layer active spinner-red-only">
                           <div class="circle-clipper left">
                               <div class="circle"></div>
                           </div>
                           <div class="gap-patch">
                               <div class="circle"></div>
                           </div>
                           <div class="circle-clipper right">
                               <div class="circle"></div>
                           </div>
                       </div>
                   </div>
             `;

            $('.theme-cutomizer').sidenav('open');
            $('.page-box').html(loader);
        ajax = $.get('opt_plan_hod_table_pg?sno='+sno+' ',(data)=>{
                $('.page-box').html(data); 
                ajax = null;
            });
        })
</script> -->