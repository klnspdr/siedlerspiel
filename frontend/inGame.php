<div class="fieldArea" id="gameCanvas"></div>
<div class="inventoryArea">
    <table id="invTable">

        <tr>
            <th>INVENTORY</th>
        </tr>
        <tbody id="invTableBody">

        </tbody>
    </table>
</div>
<div class="logArea">
    <table id="logTable">

        <tr>
            <th>LOG</th>
        </tr>
        <tbody id="logTableBody">

        </tbody>
    </table>
</div>
<div class="buttonArea">
    <table id="buyButtonTable">
        <tr>
            <th><span class="tableName">Kaufen</span></th>
        </tr>
        <?php
        $clientRole = $_SESSION['role'];
        //get number of rows: 4 Buttons per row
        $number_rows = ceil($number_items / 5);
        for ($row = 0; $row < $number_rows; $row++) {
            $tableRowOut = "<tr>";
            for ($col = 1; $col <= 5; $col++) {
                $buttonNum = $row * 5 + $col;
                $buttonName = $config['item' . $buttonNum]['name'];
                $tableRowOut .= "<td>";
                    if ($buttonNum <= $number_items) {
                        $tableRowOut .= "<a class='button buyItem' onclick='buyItemButton($buttonNum, $clientRole)' id='item" . $buttonNum . "' href='#'>" . $buttonName . "</a>";
                    }
                $tableRowOut .= "</td>";
            }
            $tableRowOut .= "</tr>";
            echo $tableRowOut;
        }
        ?>
    </table>
    <table id="actButtonTable">
        <tr>
            <th><span class="tableName">Aktionen</span></th>
        </tr>
        <?php
        for($row = 1; $row <= $number_actions; $row++){
            $tableRowOut = "<tr><td><a class='button' onclick='runActionButton($row, $clientRole)' id='actAction".$row."' href='#'>".$config['action'.$row]['name']."</a></td></tr>";
            echo $tableRowOut;
        }
        ?>
    </table>
</div>
