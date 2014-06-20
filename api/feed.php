<?php

header('Content-type: application/json');
header('Access-Control-Allow-Origin: *');

class Feed {
	private $url, $feed;

	public function __construct($url) {
		$this->url = $url;
		$this->feed = $this->parse($this->scrape());
	}

	private function scrape() {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $this->url);
		curl_setopt($ch, CURLOPT_HEADER, false); 
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_USERAGENT, 'PWFantasy API Scraper/2.0'); 
		$buffer = curl_exec($ch);
		curl_close($ch);
		if (empty($buffer)) {
			header('HTTP/1.0 504 Gateway Time-out');
			die('{"status": "error","code": 504,"message" : "Gateway Timeout"}');
		}
		if (preg_match('/404 - Not Found/', $buffer)) {
			header('HTTP/1.0 404 Not Found');
			die('{"status": "error","code": 404,"message" : "Entity Not Found"}');
		}
		return $buffer;
	}

	private function parse($feed) {
		libxml_use_internal_errors(true);
		$xml = simplexml_load_string($feed);
		if ($xml !== false) {
			return $xml->channel;
		} else {
			header('HTTP/1.0 404 Not Found');
			die('{"status": "error","code": 404,"message" : "Entity Not Found"}');
		}
	}

	private function _cleanup() {
		foreach($this->feed->item as $item) {
			$item->title = (string)$item->title;
		}
	}

	public function json_feed() {
		$this->_cleanup();
		return json_encode($this->feed);
	}
}

$url = 'http://prowrestling.net/rss.xml.php';
if (isset($_GET['site']) && $_GET['site'] == 'pwtorch') $url = 'http://pwtorch.com/artman2/publish/rss.xml';
//file_put_contents('log.txt', date('m/d/Y h:m') .' '. $_GET['site'] .' '. $_SERVER['REMOTE_ADDR'] .' '. "\r\n", FILE_APPEND);
$feed = new Feed($url);
echo $feed->json_feed();