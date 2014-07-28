IFTTN - If This Then Node
=================

IFTTN is a NodeJS based server which allows you to receive actions from [IFTTT](http://www.ifttt.com). It can be used to run on a Raspberry PI in your local network to use IFTTT for further home automation and other tasks.

The idea is based on [ifttt-webhook](https://github.com/captn3m0/ifttt-webhook/) which fakes a WordPress XML RPC API to execute webhooks from IFTTT as there is no custom interface at IFTTT which can be used for general purposes.

IFTTN basically does nothing different: it fakes a WordPress XML RPC API. Using plugin you're able to implement your own custom actions.

# Usage

git clone IFTTN to wherever you want and run [NMP](https://www.npmjs.org/) afterwards to install all dependencies:
```
git clone git@github.com:sebauer/if-this-then-node.git
nmp install
```

The next step is to set your custom authentication details in `config.js`. You need to use the credentials in the IFTTT WordPress channel.
```javascript
var config = {
	'user': 'myuser',		// Set your username here
	'pw'	: 'mypw'			// Set your password here
}
```

IFTTN uses [bunyan](https://www.npmjs.org/package/bunyan) for log-output. To have an easy readable output on your console, log output should be redirected to bunyan. If you don't have bunyan installed globally but (automatically) installed as dependency run the following command:
```
node server | ./node_modules/bunyan/bin/bunyan
```

Have a look at the bunyan documentation if you want to further define which log level you want to see. If you want the server constantly running in the background, you can use [forever](https://www.npmjs.org/package/forever).

In IFTTT configure a new recipe with any trigger you like and WordPress as action channel. Configure the channel with the URL to your instance of IFTTN and the user credentials you set in the config.js previously. By default this application runs on port 1337 and you might have to configure a port redirect in your router to make the instance of NodeJS accessible from the internet.

For the WordPress action in IFTTT basically only 2 fields are required by this plugin, all other fields can be set to anything you whish:
 * Body
 * Categories

## Body
The Body field is used to tell the IFTTN server which plugin should be called. A list of available plugins can be seen during the startup of IFTTN. Just use that name as the post body.

## Categories
The categories are used for submitting parameters to the plugin. For example the Wake On Lan plugin uses 2 parameters, a broadcast address and a MAC address. Parameters (or categories) will be written as comma separated lists. The parameter itself as a key/value pair. For the WOL plugin this would look like:
```
broadcast=192.168.1.255,mac=00:00:00:00:00:00
```

Values will be assigned by using the = sign, so you cannot use this as a value itself.

![IFTTT Configuration](http://sebauer.github.io/if-this-then-node/images/ifttt-screenshot.jpg)

Now the action should be all set up and you're able to trigger it.

# Plugins
Plugins are used for implementing new commands or actions into IFTTN. Just have a look at the [sample plugin](https://github.com/sebauer/if-this-then-node/blob/master/plugins/sample-plugin.js) inside the plugins-directory, it should be pretty self-explaining. The most important thing is that EVERY plugin must at least implement the functions info() and run(params, callback).

The "params" variable holds all parameters from IFTTT as an object. Using the example of our WOL-plugin this object would look like:
```javascript
{
	'broadcast': '192.168.1.255',
	'mac': '00:00:00:00:00:00'
}
```

The callback parameter holds the callback function executed from IFTTN. It expects an result object as parameter:
```javascript
{
	'success': true,
	'output': 'your output text here'
}
```

Please note, that you MUST call the callback in your plugin as IFTTN would cannot send a response back to IFTTT. This would make IFTTT wait for a response until a timeout is reached and might result in your recipe being disabled after several failures.

## Available plugins
### wakeonlan - Wake On Lan
This plugin can be used to wake up a PC which supports Wake On Lan. This plugin depends on "wakeonlan". You might also use etherwake, but that needs to be implemented, yet. The following parameters need to be set in your action-configuration in IFTTT:
 * __broadcast__ - The broadcast address of the system you're trying to wake up. If it has the local IP 192.168.1.1 the broadcast address usually is 192.168.1.255
 * __mac__ - The MAC address of the interface which is beeing accessed written as 00:00:00:00:00:00

### windows-shutdown-linux - Shutdown Windows from Linux
Does exactly what it says it does. It shuts down a Windows PC from a Linux system. It requires a local user profile with administrative privileges on the Windows system and the ``samba-common`` package to be installed on the Linux system executing the command. On some systems you might need to first uninstall samba-common first and reinstall it before the net-command is available. Run:
```
sudo apt-get remove samba-common
sudo apt-get install samba-common
```
The following parameters need to be set in your action-configurtion in IFTTT:
 * __ip__ - The local IP address of the system
 * __user__ - The username of the administrative user on the target system
 * __pw__ - The password of the administrative user on the target system
