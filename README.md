# IFTTN - If This Then Node
[![Build Status](https://travis-ci.org/sebauer/if-this-then-node.svg?branch=master)](https://travis-ci.org/sebauer/if-this-then-node) [![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

IFTTN is a NodeJS based server which allows you to receive actions from [IFTTT](http://www.ifttt.com). It can be used to run on a Raspberry PI in your local network to use IFTTT for further home automation and other tasks.

The new version is based on [IFTTT "Maker"](http://ifttt.com/maker) feature and receives JSON requests to handle further actions.

# Setup and Configuration

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
node start | ./node_modules/bunyan/bin/bunyan
```

Have a look at the bunyan documentation if you want to further define which log level you want to see. If you want the server constantly running in the background, you can use [forever](https://www.npmjs.org/package/forever).
## Port Forwarding
If your if-this-then-node instance is behind a router, you have to make it accessible to the internet. For this you need to configure a port forwarding in your router. if-this-then-node runs on port 1337, so you have to expose port 1337 on your host to the internet.

## Test if IFTTN works
To test whether if-this-then-node can be accessed successfully, you can visit http://<host>:<port>/ifttn/

Of course you have to replace <host> by your hostname or ip address (the external!) and port by the port which should be forwarded to your if-this-then-node instance. You should see a message like "IFTTN - if-this-then-node Version x.x.x is up and running!".

## A word about security
IFTTN has a very simple authentication mechanism built in using a user and a password. I strongly recommend to use some kind of reverse proxy in front of your if-this-then-node instance which is accessible using HTTPS. If you do that, please note that IFTTT does not accept self-signed certificates!

# Configuration of IFTTT Recipe
In IFTTT configure a new recipe with any trigger you like and Maker as action channel.
## URL
In your recipe set the URL to your instance of IFTTN, which could look like:
```
http://myifttnserver.anydns.info:1337/ifttn/
```
By default this application runs on port 1337 and you might have to configure a port redirect in your router to make the instance of NodeJS accessible from the internet. See above.

## Method
if-this-then-node only accepts request sent as POST request. So you have to select "POST" here.

## Content Type
We're sending JSON requests, so choose "application/json".

## Body
This is the most crucial part. You have to send a JSON structure, which contains some information, which is always required, as well as some additional information.

Let's have a look at this sample for the limitless-zone-onoff plugin:
```javascript
{
"action": "limitless-zone-onoff", // always required
"user": "myuser", // always required
"pw": "mypassword",  // always required
"host": "192.168.178.24",
"port": "8899",
"zone": "3",
"onoff": "on"
}
```
As you can see, there are 3 parameters which are always required. That is the username and password you just configured in your config.js and the "action", which is the name of the plug in, you wish to execute.

All other parameters are plugin-dependent. Please check the documentation of the specific plugins.

Now the action should be all set up and you're able to trigger it.

# Plugins
Plugins are used for implementing new commands or actions into IFTTN.

## Available plugins
### wakeonlan-linux - Wake On Lan (from Linux systems)
This plugin can be used to wake up a PC which supports Wake On Lan. This plugin depends on "wakeonlan". You might also use etherwake, but that needs to be implemented, yet. The following parameters need to be set in your action-configuration in IFTTT:
* __broadcast__ - The broadcast address of the system you're trying to wake up. If it has the local IP 192.168.1.1 the broadcast address usually is 192.168.1.255
* __mac__ - The MAC address of the interface which is beeing accessed written as 00:00:00:00:00:00

#### Sample Request Body for IFTTT Maker Recipe
A sample request body would look like this:

```javascript
{
"action": "wakeonlan-linux",
"user": "myuser",
"pw": "mypassword",
"broadcast": "192.168.1.255",
"mac": "00:00:00:00:00:00"
}
```

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


#### Sample Request Body for IFTTT Maker Recipe
A sample request body would look like this:

```javascript
{
	"action": "wakeonlan-linux",
	"user": "myuser",
	"pw": "mypassword",
	"ip": "192.168.1.255",
	"windowsuser": "windows-username",
	"windowspw": "windows-password"
}
```
### LimitlessLED
The "LimitlessLED" plugins can be used to control any LimitlessLED (also known as "MiLight" or "IWY Light" system using IFTTT.

More information can be found [here](http://www.wifiledlamp.com/service/applamp-api/), [here](http://www.limitlessled.com/dev/) and [here](http://www.msxfaq.de/lync/impresence/iwylight.htm).

#### limitless-zone-onoff
An easy plugin for remotely turning on or off the lights of a specified zone.

The following parameters need to be set in your action-configuration in IFTTT:
* __host__ - The local IP address of your MiLight WIFI-Gateway
* __port__ - The UDP port your MiLight-WIFI-Gateway is listening on
* __zone__ - The number of the zone you wish to control. Numbers 1-4 usually.
* __onoff__ - Whether to turn your zone on or off. Values: on, off

```javascript
{
	"action": "limitless-zone-onoff", // always required
	"user": "myuser", // always required
	"pw": "mypassword",  // always required
	"host": "192.168.178.24",
	"port": "8899",
	"zone": "3",
	"onoff": "on"
}
```

#### limitless-onleave-autooff
This plugin turns off your lights if all known clients have left. You can use this plugin together with IFTTT's geofencing features. Please note: if you are living with multiple people, each of them might need to have IFTTT running on their mobile phones and have this recipe set up and running. This is due to the fact, that the plugin needs to run a list of "accepted" clients in order to know when the last person has left and the lights can finally be turned off.

This plugin requires redis. On Ubuntu/Debian/Respbian it can be installed like this:
```
sudo apt-get install redis-server
```

The following parameters need to be set in your action-configuration in IFTTT:
* __host__ - The local IP address of your MiLight WIFI-Gateway
* __port__ - The UDP port your MiLight-WIFI-Gateway is listening on
* __clientname__ - The name of the client this recipe is running for
* __enterexit__ - {{EnteredOrExited}} - IFTTT's ingredient to tell whether someone has entered or exited the geofence

```javascript
{
	"action": "limitless-zone-onoff", // always required
	"user": "myuser", // always required
	"pw": "mypassword",  // always required
	"host": "192.168.178.24",
	"port": "8899",
	"clientname": "myclientname",
	"enterexit": "{{EnteredOrExited}}" // this is an ingredient from IFTTT
}
```


## Writing Plugins
Just have a look at the [sample plugin](https://github.com/sebauer/if-this-then-node/blob/master/plugins/sample-plugin.js) inside the plugins-directory, it should be pretty self-explaining. The most important thing is that EVERY plugin must at least implement the functions info() and run(params, log, callback).

The "params" variable holds all parameters from IFTTT as an object. Using the example of our WOL-plugin this object would look like:
```javascript
{
	'broadcast': '192.168.1.255',
	'mac': '00:00:00:00:00:00'
}
```

The log parameter is a reference to the instance of the logger (bunyan) which allows you to log custom messages:
```javascript
log.info('Foo %s', bar);
```

The callback parameter holds the callback function executed from IFTTN. It expects an result object as parameter:
```javascript
{
	'success': true,
	'output': 'your output text here'
}
```

Please note, that you MUST call the callback in your plugin as IFTTN would cannot send a response back to IFTTT. This would make IFTTT wait for a response until a timeout is reached and might result in your recipe being disabled after several failures.
