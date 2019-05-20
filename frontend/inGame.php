 <canvas id="gameField"></canvas>
 <table id="buttonTable">
          <tr>
              <th>Kaufen</th>
          </tr>
          <?php
            for($row = 1; $row <= $number_items; $row++){
                $tableRowOut = "<tr><td><a class='button' id='buyItem".$row."'href='#'>";
                $actualItemName = $config['item'.$row]['name'];
                $tableRowOut .= $actualItemName . "</a></td></tr>";
                echo $tableRowOut;
            }
            ?>
 </table>
