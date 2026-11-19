<ul class="timeline">

    <!-- Request Created -->
    <li class="timeline-item">
        <div class="timeline-icon blue">
            <i class="material-icons white-text">assignment</i>
        </div>

        <div class="timeline-content card">
            <div class="card-content">
                <span class="card-title">Request Submitted</span>
                <small class="grey-text">
                    <?= $ps20[0]['actdate']; ?>
                </small>
                <!-- <p>
                    Service Needed:
                    <strong><?= $ps20[0]['council_needed']; ?></strong>
                </p> -->
                <p>
                    Service Description:
                    <strong><?= $ps20[0]['email']; ?></strong>
                </p>
            </div>
        </div>
    </li>

    <!-- Timeline Logs -->
    <?php foreach ($ps20 as $row): ?>

        <?php
            // Decide title by state
            switch ($row['state']) {
                case '0':
                    $title = 'Comment Given';
                    $icon  = 'comment';
                    $color = 'green';
                    break;
                case '1':
                    $title = 'Assigned To: ' . ($row['fullname'] ?? 'Officer');
                    $icon  = 'person_add';
                    $color = 'green';
                    break;

                case '2':
                    $title = 'Reassigned To: ' . ($row['fullname'] ?? $row['reassigned_to']);
                    $icon  = 'swap_horiz';
                    $color = 'orange';
                    break;

                case '3':
                    $title = 'Progress Report Submitted';
                    $icon  = 'timeline';
                    $color = 'teal';
                    break;

                case '4':
                    $title = 'Request Completed';
                    $icon  = 'check_circle';
                    $color = 'purple';
                    break;

                default:
                    $title = 'Status Updated';
                    $icon  = 'info';
                    $color = 'grey';
            }
        ?>

        <li class="timeline-item">
            <div class="timeline-icon <?= $color; ?>">
                <i class="material-icons white-text"><?= $icon; ?></i>
            </div>

            <div class="timeline-content card">
                <div class="card-content">
                    <span class="card-title"><?= $title; ?></span>

                    <small class="grey-text">
                        <?= $row['actdate']; ?>
                    </small>

                    <?php if (!empty($row['comments'])): ?>
                        <p>Comment: <?= htmlspecialchars($row['comments']); ?></p>
                    <?php endif; ?>

                    <!-- <p class="grey-text text-darken-1">
                        Handled By:
                        <strong><?= $row['received_by']; ?></strong>
                    </p> -->
                </div>
            </div>
        </li>

    <?php endforeach; ?>

</ul>
