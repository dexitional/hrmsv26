      <!-- CREATE & UPDATE FORM -->
      <h5 class="theme-cutomizer-title red lighten-4 pt-2 pr-2 pl-2 pb-3 mt-10 circle-rounded white-text text-darken-4 gradient-45deg-indigo-blue box-shadow-none border-round center">LEAVE APPROVAL</h5>
      
     <form class="mb-5 mt-5" name="approveleave" action="approveleave" method="post">
        <div class="row ">
          <div class="input-field col s12">
          
          </div>
          <div class="card hoverable animate fadeLeft">
                <div class="card-content">
                    <ul class="collection">
                      <li class="collection-item"><h6><b>DAYS ENTITLED: <?= $data['entitlement'] ?> DAYS</b></h6></li>
                    </ul>
                </div>
          </div>
          
          <div class="input-field col s12">
            <i class="material-icons prefix">  </i>
            <input id="approved_days" name="approved_days" value="<?= $data['approved_days'] ?>" required type="number" min="0" max="<?= $data['entitlement'] ?>" class="validate">
            <label for="approved_days" class="<?= $data['approved_days'] != '' ? 'active':'' ?>">LEAVE DAYS</label>
          </div>

          <div class="input-field col s12">
            <i class="material-icons prefix">  </i>
            <input  type="date" value="<?= $data['start_date'] ?>" name="start_date" required class="validate" id="start_date">
            <label for="start_date">EXPECTED START DATE</label>
          </div>

          <div class="input-field col s12">
            <i class="material-icons prefix">search</i>
            <input type="text" id="relieved_by_search" name="relieved_by_search" list="relieved_by_list" autocomplete="off" placeholder="Type staff name or staff number" class="validate">
            <label for="relieved_by_search" class="active">RELIEVED BY ( STAFF NO )</label>
            <input type="hidden" name="relieved_by" id="relieved_by_value" value="">
            <datalist id="relieved_by_list">
              <option value="ALLOW FOR DHR ACTION" data-staff-no="000"></option>
              <?php foreach($members as $m){ ?>
              <option value="<?= htmlspecialchars($m['name'].' ('.$m['staff_no'].')') ?>" data-staff-no="<?= htmlspecialchars($m['staff_no']) ?>"></option>
              <?php }?>
            </datalist>
            <small class="grey-text text-darken-1">Start typing a staff name or number to find the right person quickly.</small>
          </div>

         <div class="card-action pl-0 pr-0 center-align">
                <button class="btn-small waves-effect waves-light light-blue darken-3" id="save-leave"><b>ENDORSE</b></button>
                <button type="button" class="btn-small waves-effect waves-light red darken-3 sidenav-close" style="height:25px;font-size:15px;line-height:10px"><b>X</b></button>
                <input type="hidden" name="entitlement" value="<?= $data['entitlement'] ?>"/>
                <input type="hidden" name="typeid" value="<?= $data['type_id'] ?>"/>
                <input type="hidden" name="group" value="<?= $data['staff_group'] ?>"/>
                <input type="hidden" name="sno" value="<?= $data['staff_no'] ?>"/>
                <input type="hidden" name="id" value="<?= $data['id'] ?>"/>
         </div>
      </form>

      <script>
      document.addEventListener('DOMContentLoaded', function () {
          var searchInput = document.getElementById('relieved_by_search');
          var hiddenInput = document.getElementById('relieved_by_value');
          var datalist = document.getElementById('relieved_by_list');

          if (!searchInput || !hiddenInput || !datalist) {
              return;
          }

          var syncRelievedBy = function () {
              var selectedValue = searchInput.value;
              var matchedOption = null;

              Array.prototype.forEach.call(datalist.options, function (option) {
                  if (option.value === selectedValue) {
                      matchedOption = option;
                  }
              });

              if (matchedOption && matchedOption.getAttribute('data-staff-no')) {
                  hiddenInput.value = matchedOption.getAttribute('data-staff-no');
              } else if (selectedValue === 'ALLOW FOR DHR ACTION') {
                  hiddenInput.value = '000';
              } else {
                  hiddenInput.value = '';
              }
          };

          searchInput.addEventListener('input', syncRelievedBy);
          searchInput.addEventListener('change', syncRelievedBy);
      });
      </script>

      <!-- RECORD VIEW -->
     
          
         </ul>
      </div>
    </div>

    <script src="../../public/js/main.js"></script>



