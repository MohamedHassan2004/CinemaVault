using CinemaVault.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.DAL.IRepository
{
    public interface IReviewRepository : IRepository<Review>
    {

        Task<IEnumerable<Review>> GetReviewByMovieId(int MovieId);

    }
}
