<div class="fieldArea" id="gameCanvas"></div>
<div class="inventoryArea">

</div>
<div class="logArea">

    dasgfjksdghfjklasfdasjflksadjfklsahfkldsahfkjdsahgfjkdsa
</div>
<div class="buttonArea">
    <table id="buyButtonTable">
        <tr>
            <th><span class="tableName">Kaufen</span></th>
        </tr>
        <?php
        //get number of rows: 4 Buttons per row
        $number_rows = ceil($number_items / 5);
        for ($row = 0; $row < $number_rows; $row++) {
            $tableRowOut = "<tr>";
            for ($col = 1; $col <= 5; $col++) {
                $buttonNum = $row * 5 + $col;
                $buttonName = $config['item' . $buttonNum]['name'];
                $tableRowOut .= "<td>";
                    if ($buttonNum <= $number_items) {
                        $tableRowOut .= "<a class='button' id='buyItem" . $buttonNum . "' href='#'>" . $buttonName . "</a>";
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
            <th><span class="tableName">Ausführen</span></th>
        </tr>
        <?php
        for($row = 1; $row <= $number_actions; $row++){
            $tableRowOut = "<tr><td><a class='button' id='actAction".$row."' href='#'>".$config['action'.$row]['name']."</a></td></tr>";
            echo $tableRowOut;
        }
        ?>
    </table>
</div>
