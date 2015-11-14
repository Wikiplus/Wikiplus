<?php
// FeelyFramework 核心框架-min

// 框架核心类
class Core{
	static $__config;
	//主执行逻辑
	static public function run(){
		$patha = $_SERVER['PHP_SELF'];
		$seppos = strpos($patha, "index.php"); //index.php分隔位置
		$dirname = substr($patha, 0, $seppos - 1); //路径名
		define('__ROOT__', $dirname); //定义根目录路径。
		$parapath = substr($patha, $seppos + 10); //URI PATHINFO
		
		try{
			//根据PATHINFO进行路由
			$routeResult = self::route($parapath);
			$className = $routeResult['class']."Controller";
			$methodName = $routeResult['method'];
			$args = $routeResult['args'];
			array_shift($args);

			//产生控制器对象
			$destController = self::objectFactory($className);
			//调用控制器
			call_user_func_array(array($destController, $methodName), $args);
		}catch(Exception $e){
			Core::showError($e);
		}
	}

	//按照传入的key获取设置
	static public function config($key){
		if(!isset(self::$__config)){
			self::$__config = require_once(__PATH__."/config.php");
		}
		return self::$__config[$key];
	}

	//路由解析，根据路由文件解析出URI请求的类，方法以及参数
	//返回格式：Array ( "class" => 类名, "method" => 方法名, "args" => Array 参数列表 )
	static public function route($parapath){
		$__route = require_once(__PATH__."/route.php"); //载入路由列表

		$args = array(); //空数组，用于存储捕获。
		$class = "_empty";
		$method = "_empty";
		foreach ($__route as $pat => $dest) {
			$pat = addcslashes($pat, '/');
			$pattern = "/".$pat."/";
			if(preg_match($pattern, $parapath, $args)){
				$destArray = explode("/", $dest);
				$class = $destArray[0];
				$method = $destArray[1];
				return array(
					"class" => $class,
					"method" => $method,
					"args" => $args,
					);
			}
		}
		throw new Exception("无法找到和请求匹配的路由模式：".$parapath);
	}

	//自动载入
	static public function autoload($class){
		$path = __PATH__;

		try{
			if(strpos($class, "Model")){
				$path .= "/Model/";
			}else if(strpos($class, "Controller")){
				$path .= "/Controller/";
			}else{
				throw new Exception("无效类名。");
			}

			$fileName = $path.$class.".class.php";
			if(!file_exists($fileName)){
				throw new Exception("无法载入类：文件不存在——".$fileName);
			}
			require_once($path.$class.".class.php");
		}catch(Exception $e){
			Core::showError($e);
		}
	}

	//对象工厂
	static public function objectFactory($class){
		try{
			return new $class;
		}catch(Exception $e){
			Core::showError($e);
		}
	}

	//错误处理
	static public function showError($e){
		header('HTTP/1.1 404 Not Found');
		header('Status: 404 Not Found');
		echo '<html><head><title>发生了错误</title><style>body{font-family: "微软雅黑";}</style></head><body><h2>Error:</h2><h3>'.$e->getMessage().'</h3>
			<p>错误位置：<b>'.$e->getFile().'</b> on Line <b>'.$e->getLine().'</b></p>
			<p>&nbsp;</p><p><b>Trace:</b></p><p>'.nl2br($e->getTraceAsString()).'</p>
			<hr><p>FeelyFramework 0.4</p></body></html>';
		exit();
	}
}

class Controller{
	protected $isAdmin;
	function __construct(){
		session_start();
		if(preg_match('/gzip/',$_SERVER['HTTP_ACCEPT_ENCODING'])){
			ob_start('ob_gzhandler');
		}else{
			ob_start();
		}
	}
	protected function display($assign, $viewName){
		$view = new View($viewName);
		$view->set($assign);
		$view->render();
		ob_flush();
	}
	protected function ajaxReturn($data, $status=200){
		header('Content-Type: application/json', true, $status);
		echo json_encode($data);
		ob_flush();
	}
}

class Model{
	static private $model_conn;
	private $sql;

	function __construct($table_name){
		$this->table_name = $table_name;
		$this->sql = "";
		$this->connect();
	}
	function __destruct(){
		//由于使用PDO代替传统的mysqllib连接方式，这里原本的关闭连接暂时弃用。
	}
	
	private function connect(){
		if(is_null(self::$model_conn)){
			try{
				$dsn = Core::config('db_type').":host=".Core::config('db_host').";port=".Core::config('db_port').";dbname=".Core::config('db_database');
				$PDO_ATTR = array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'");
				self::$model_conn = new PDO($dsn, Core::config('db_user'), Core::config('db_pass'), $PDO_ATTR);
			}catch(Exception $e){
				Core::showError("数据库连接错误：".$e);
			}
		}
		return self::$model_conn;
	}
	
	protected function sql(){
		$db = self::$model_conn;
		$this->sql = $db->prepare(func_get_arg(0));
		$arg_length = func_num_args();
		try{
			for($i = 1; $i < $arg_length; $i++){
				$this->sql->bindValue($i, func_get_arg($i));
			}
		}catch(Exception $e){
			Core::showError("数据库参数绑定错误：".$e);
		}
		return $this;
	}
	
	protected function select(){
		try{
			$this->sql->execute();
			$res = $this->sql->fetchAll();
			return $res;
		}catch(Exception $e){
			Core::showError("在数据库查询过程中出现异常：".$e);
		}
	}
	
	protected function execute(){
		try{
			return $this->sql->execute();
		}catch(Exception $e){
			Core::showError("在数据库执行过程中出现异常：".$e);
		}
	}
	
	protected function F($text){
		return addslashes($text);
	}
}

class View{
	private $templateName;
	private $templatePath;
	private $__tempArgs;
	function __construct($_templateName){
		$this->templateName = $_templateName;
	}
	public function set($assign){
		$this->__tempArgs = $assign;
	}
	public function render(){
		$this->templatePath = __PATH__."/Themes/".$this->templateName.".php";
		$__t['title'] = getConfig('default_title');
		$__t = $this->__tempArgs;
		foreach ($this->__tempArgs as $___key => $___value) {
			${$___key} = $___value;
		}
		if(!file_exists($this->templatePath)){
			throw new Exception("无法载入主题：文件不存在——".$this->templatePath);
		}
		include($this->templatePath);
	}
	static public function loadHtml($name, $__tempArgs){
		$__loadPath = __PATH__."/Themes/".$name.".php";
		foreach ($__tempArgs as $key => $value) {
				${$key} = $value;
		}
		if(!file_exists($__loadPath)){
			throw new Exception("无法载入主题：文件不存在——".$__loadPath);
		}
		include($__loadPath);
	}
}

//全局函数
function getConfig($key){
	return Core::config($key);
}

//载入其他模板文件
function loadHtml($name, $__tempArgs){
	View::loadHtml($name, $__tempArgs);
}

//【前端】载入静态资源文件
function SR($name){
	return __ROOT__."/Public/".$name;
}

//【前端】根据安装目录获得正确相对地址
function U($path){
	return __ROOT__.$path;
}

//================================================

//取得当前目录，并定义给__PATH__
define("__PATH__",str_replace("\\", "/", dirname(__FILE__)));
//注册自动载入
if(function_exists('spl_autoload_register')){
	spl_autoload_register(array('Core', 'autoload'));
}else{
	function __autoload($class){
		return Core::autoload($class);
	}
}

//启动核心
Core::run();