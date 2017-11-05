<?php

	$rawContent = $_POST['rawContent'];
	file_put_contents('saved-content.txt',$rawContent);