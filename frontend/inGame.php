<div id="backArrow"><a href="/?reset"><img src="img/arrow_back.svg"></a></div>
<div class="fieldArea" id="gameCanvas"></div>
<div class="inventoryArea">
    <div id="hpBar">
        <span id="hpBarText"></span>
    </div>
    <table id="invTable">

        <tr>
            <th colspan="6" class="subTableName">Inventar</th>
        </tr>
        <tbody id="invTableBody">

        </tbody>
    </table>
</div>
<div class="logArea">
    <table id="logTable">

        <tr>
            <th class="subTableName">LOG</th>
        </tr>
        <tbody id="logTableBody">

        </tbody>
    </table>
</div>
<div class="buttonArea">
    <table id="buyButtonTable">
        <tr>
            <th colspan="5"><span class="tableName">Kaufen</span></th>
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
                        $tableRowOut .= "<button class='button buyItem' onclick='buyItemButton($buttonNum, \"$buttonName\", $clientRole)' id='item" . $buttonNum . "' href='#'><span><img class='button_icon' alt='' src='".$config['icon_file_dir'].$config['item'.$buttonNum]['icon_file_name']."'>  " . $buttonName . "</span></button>";
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
            <th colspan="1"><span class="tableName">Aktionen</span></th>
        </tr>
        <?php
        for($row = 1; $row <= $number_actions; $row++){
            $tableRowOut = "<tr><td><button class='button' onclick='runActionButton($row, \"".$config['action'.$row]['name']."\", $clientRole)' id='actAction".$row."' href='#'>".$config['action'.$row]['name']."</button></td></tr>";
            echo $tableRowOut;
        }
        ?>
    </table>
</div>
