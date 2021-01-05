#[allow(dead_code)]

/// Generic Error type for the server
pub struct GenericError
{
    msg: String,
    kind: ErrorKind
}

impl GenericError
{
    /// Create a new GenericError from a message and an error kind
    pub fn new(msg: String, kind: ErrorKind) -> Self
    {
        Self
        {
            msg,
            kind
        }
    }
}

/// Types of errors required for the server process
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ErrorKind
{
    ACIError
}

impl std::fmt::Display for GenericError
{
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result
    {
        write!(f, "{} {}", ansi_term::Color::Red.bold().paint("error:"), self.msg)
    }
}

impl std::convert::From<aci::errors::ACIError> for GenericError
{
    fn from(error: aci::errors::ACIError) -> Self
    {
        match error
        {
            aci::errors::ACIError::ClientError(error) =>
            {
                Self::from(error)
            },
            aci::errors::ACIError::ServerError(error) =>
            {
                Self::from(error)
            }
        }
    }
}

impl std::convert::From<aci::errors::ACIClientError> for GenericError
{
    fn from(error: aci::errors::ACIClientError) -> Self
    {
        Self::new(format!("{}", error), ErrorKind::ACIError)
    }
}

impl std::convert::From<aci::errors::ACIServerError> for GenericError
{
    fn from(error: aci::errors::ACIServerError) -> Self
    {
        Self::new(format!("{}", error), ErrorKind::ACIError)
    }
}

/// Generic result type for wrapping results with GenericError 
pub type GenericResult<T> = Result<T, GenericError>;