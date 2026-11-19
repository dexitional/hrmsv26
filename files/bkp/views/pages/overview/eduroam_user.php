      <!-- CREATE & UPDATE FORM -->
      <h5 class="theme-cutomizer-title red lighten-4 pt-2 pr-2 pl-2 pb-3 mt-10 circle-rounded white-text text-darken-4 gradient-45deg-indigo-blue box-shadow-none border-round center"> EDUROAM CREDENTIALS </h5>
      <button type="button" class="btn-small waves-effect waves-light red darken-3 sidenav-close" style="height:25px;font-size:15px;line-height:10px"><b>X</b></button>
          <ul id="issues-collection" class="collection z-depth-1">
              <li class="collection-item red lighten-5"><img src="./public/images/eduroam.png" class="center-align" height="100px"/></li>
              <li class="collection-item light-blue lighten-5"><h6 class="light-blue-text text-darken-4" style="font-size:15px"></h6></li>
              <li class="collection-item">
                  <div class="row">
                    <div class="col s12">
                        <p class="collections-title font-weight-600"><strong>#</strong> USERNAME</p>
                        <p class="collections-content light-blue-text text-darken-3 font-weight-bolder"><em><b><?= $email;?></b></em></p>
                    </div>
                  </div>
              </li>

              <!-- <li class="collection-item">
                  <div class="row">
                    <div class="col s12">
                        <p class="collections-title font-weight-600"><strong>#</strong> PASSWORD</p>
                        <p class="collections-content light-blue-text text-darken-3 font-weight-bolder"><em><b><?= strlen($password) <= 8 ? $password : '<em>No password declared!</em>' ;?></b></em></p>
                    </div>
                  </div>
              </li> -->
            </ul>