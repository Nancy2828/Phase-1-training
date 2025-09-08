namespace BookingPortal.Models
{
    public class DashboardStatsDto
    {
        public List<string> Months { get; set; } = new List<string>();
        public List<decimal> Revenue { get; set; } = new List<decimal>();
        public List<int> Orders { get; set; } = new List<int>();
    }
}
