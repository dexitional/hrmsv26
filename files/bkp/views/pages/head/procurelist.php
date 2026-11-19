      <style>
          /* The actual timeline (the vertical ruler) */
          .main-timeline-5 {
              position: relative;
              max-width: 100%;
              margin: 0 auto;
          }

          /* The actual timeline (the vertical ruler) */
          .main-timeline-5::after {
              content: "";
              position: absolute;
              width: 3px;
              background-color: #fff;
              top: 0;
              bottom: 0;
              left: auto;
              margin-left: -3px;
          }

          /* Container around content */
          .timeline-5 {
              position: relative;
              background-color: inherit;
              width: 100%;
          }

          /* The circles on the timeline */
          .timeline-5::after {
              content: "";
              position: absolute;
              width: 17px;
              height: 17px;
              /* right: 1px; */
              background-color: #fff;
              top: 18px;
              border-radius: 50%;
              z-index: 1;
          }

          /* Place the container to the right */
          .right-5 {
              padding: 0px 0px 5px 10px;
              /* left: auto; */
          }

          /* Add arrows to the right container (pointing left) */
      </style>
      <h5 class="theme-cutomizer-title red lighten-4 pt-2 pr-2 pl-2 pb-3 mt-10 circle-rounded white-text text-darken-4 gradient-45deg-indigo-blue box-shadow-none border-round center">Procurement List</h5>


      <div role="tabpanel" class="tab-pane">
          <ul>
              <?php if (!empty($pos_sql)) {
                    foreach ($pos_sql as $sqlprocure) {
                    }


                ?>
                  <section class="gradient-custom-5">
                      <form id="proDelForm" action="update_procurementdd" method="post">
                          <div class="container">

                              <?php
                                $i = 1;
                                foreach ($ps1 as $procure_data) : ?>
                                  <div class="card">
                                      <p>No.: <?= $i++; ?></p>
                                      <div class="card-content">
                                          <input type="hidden" name="rid" id="rid" value="<?= $procure_data['request_id']; ?>">
                                          <input type="hidden" name="rbid[]" id="rbid" value="<?= $procure_data['id']; ?>">
                                          <p>Product Cat.: <?= $procure_data['cat_name']; ?></p>
                                          <p>Description: <input type="text" name="desc[]" id="desc" class="form-control" value="<?= $procure_data['item_desc']; ?>"></p>
                                          <p>Quantity: <input type="number" name="quantity[]" id="quantity" class="form-control" value="<?= $procure_data['quantity']; ?>"></p>
                                          <p>Unit Price: <input type="number" name="u_price[]" readonly id="u_price" class="form-control-plaintext" readonly value="<?= $procure_data['unit_price']; ?>"></p>
                                          <p>Total Price: <input type="number" name="t_price[]" id="t_price" class="form-control-plaintext" readonly value="<?= $procure_data['total_price']; ?>"></p>
                                          <p>Budget Status:
                                          <p class="<?= (($procure_data['budget_state'] == 'UNBUDGETED') ? 'badge badge-danger' : 'badge badge-success') ?>">
                                              <?= $procure_data['budget_state']; ?></p>
                                          </p>
                                          <?php if (isset($_SESSION['uhead']) && $_SESSION['uhead'] == '01') :
                                            ?>
                                              <?php //if (isset($_SESSION['uhead']) && $_SESSION['uhead'] == '01' && $procure_data['budget_state'] == 'UNBUDGETED' && $procure_data['total_price'] <= 15000) : 
                                                ?>
                                              <div class="input-field col s12">
                                                  <!-- <i class="material-icons prefix"> </i> -->
                                                  <select class="d-block" style="width:100%;" name="unbudgeted_approve[]" id="unbudgeted_approve">
                                                      <option value="<?= (empty($procure_data['budget_status']) ? '' : $procure_data['budget_status']) ?>">
                                                          <?= (empty($procure_data['budget_status']) ? '- Approve/Disapprove -' : $procure_data['budget_status']) ?>
                                                      </option>
                                                      <option value="Approve">Approve</option>
                                                      <option value="Disapprove">Disapprove</option>
                                                  </select>
                                                  <label for="comment" class="text-uppercase">Approve/Disapprove:</label>
                                              </div>
                                          <?php endif; ?>
                                      </div>
                                  </div>
                              <?php endforeach; ?>
                              <td>Sum Total: <?= $sqlprocure['total_price']; ?></td>
                          </div>
                          <?php if (isset($_SESSION['uhead']) && $_SESSION['uhead'] < '03') : ?>
                              <div class="row">
                                  <div class="col-sm-12" id="send">
                                      <div class="form-group">
                                          <div class="text-center"><input type="submit" id="done" name="done" style="background-color:#D2262D;" class="btn btn-block font-weight-bold text-white btn-danger btn-round" value="Update Request(s)"></div>
                                      </div>
                                  </div>
                              </div>
                          <?php endif; ?>
                      </form>

                  </section>
              <?php

                    //}
                } ?>
          </ul>
      </div>