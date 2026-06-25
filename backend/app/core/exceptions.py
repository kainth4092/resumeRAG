class JobNotFoundException(Exception):
    """Exception raised when a requested job is not found."""
    def __init__(self, message: str = "Job not found"):
        self.message = message
        super().__init__(self.message)
