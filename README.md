# Coda CLI

## Setup
### Prerequisites

- You will need [node](https://nodejs.org/en/download) installed on your machine
- You will need to have a CLI tool of your choice. Common CLIs may include:
  - iTerm for Mac
  - Powershell for Windows

Optional:
- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed on your machine

## Installation

### Create the folder to store the code
In the CLI of your choice navigate to the folder where you would like to store the tool locally  
Example:
```
mkdir ~/Documents/projects/coda
cd ~/Documents/projects/coda
```
### Clone this repository into the folder

If you have [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed:
```
git clone https://github.com/JoshUptons/coda-cli.git
```
or download the .zip file from this page and manually unzip it into the folder you create for the repository  
then run the command
```
npm install
```
to install all dependencies

### Set your environment variables
You will need to create a `.env` file to store local variables  
The only required variable is the `CODA_ACCESS_KEY`  
To generate a token, go to your profile in Coda, navigate to the developer section, where there is a "generate token" button.
The name of the token does not matter, just make sure you copy the token before navigating away from the page, as you only have 1 chance.  
Make sure that the token you create does not have restricted privileges (if you leave everything default it will work)  
your `.env` file should look like
```
CODA_ACCESS_KEY=<your key>
```

You are all set.  Now you can get started by running to learn more about the commands offered.
```
coda help
```

## Usage Examples
A couple examples:

`list <table>` command
```
> coda list projects
Project 1 (Building 1)
Project 2 (Building 1)
Project 3 (Building 2)
Project 4 (Building 3)

> coda list buildings
Building 1
Building 2
Building 3
```

`create-project <project title> [building]`
```
> coda create-project 'My new Project' 'Building 1'
{
  requestId: 'mutate:9f45c70d-b443-464c-ba50-8cdc6b785d9f',
  addedRowIds: [ 'i-H05JIcM6r1' ]
}

> coda create-project 'My New Project' build
There were multiple matches to the provided building name, which would you like to choose?
Building 1
> Building 2
Building 3
{
  requestId: 'mutate:3dioh3how-3h902-012k-kd23-092309h920h',
  addedRowIds: [ 'i-h409h9203' ]
}
```
