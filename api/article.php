<?php

header('Content-type: application/json');
header('Access-Control-Allow-Origin: *');

class Article {
	private $url, $article, $type;

	public function __construct($url, $type) {
		$this->url = $url;
		$this->type = $type;
		$this->article = $this->parse($this->scrape());
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

	private function parse($article) {
		if ($this->type == 'pwtorch') {
			preg_match('/<!-- AddThis Button END -->(.*?)<!-- AddThis Button BEGIN -->/ism', $article, $match);
		} else {
			preg_match('/<table border="0" cellspacing="0" cellpadding="2">(.*?)<span class="style101">/ism', $article, $match);
		}

		if (!isset($match[1])) {
			header('HTTP/1.0 404 Not Found');
			die('{"status": "error","code": 404,"message" : "Entity Not Found"}');
		} else {
			$article = nl2br(preg_replace('/(\r|\n|\r\n|<br>|<br \/>){3,}/', '', trim(strip_tags($match[1], '<p><a><br><b><i><u>'))) );
			return array(
				'article' => $article,
				'url' => $this->url,
				'type' => $this->type
			);
		}
	}

	public function json_article() {
		return json_encode($this->article);
	}
}

$article = new Article($_GET['article'], $_GET['type']);
echo $article->json_article();