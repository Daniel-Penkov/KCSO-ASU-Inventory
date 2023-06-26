using System;
using ASU.API.Core;
using Common.Data.Models;
using Common.Data.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ASU.API.Controllers {
    public class InventoryController : StandardController<Inventory> {
        private IInventoryRepository _inventoryRepository;

        public InventoryController(IInventoryRepository inventoryRepository) : base(inventoryRepository) {
            _inventoryRepository = inventoryRepository;
        }

        // GET: api/Inventory/{id}?history={bool}
        [Route("{id}", Order = -1), AcceptVerbs("GET")]
        public JsonResult Get(long id, bool history = false) {
            if (history) {
                try {
                    return new JsonResult(_inventoryRepository.GetModifyHistory(id, GetUser()));
                } catch (Exception ex) {
                    return ErrorResult(ResponseCode.GET_FAILED, "An error occurred while retrieving the Inventory history information", ex);
                }
            } else {
                return base.Get(id);
            }
        }

        // POST: api/Inventory/assignment
        [HttpPost("assignment/"), ActionName("saveInventoryAssignment")]
        public JsonResult PostAssignment([FromBody]Inventory i) {
            if (string.IsNullOrEmpty(i.AssignedToType) || i.AssignedToId == null || i.CheckoutDate == null) {
                return ErrorResult(ResponseCode.OBJECT_NULL, "AssignedToType, AssignedToId, and CheckoutDate cannot be null");
            }

            try {
                var result = _inventoryRepository.AssignInventory(i.Id,
                    i.AssignedToType,
                    i.AssignedToId.GetValueOrDefault(),
                    i.CheckoutDate.GetValueOrDefault(),
                    i.Location,
                    GetUser());

                if (result) {
                    return SuccessResult(ResponseCode.SAVED, $"Inventory Assignment was successful");
                } else {
                    return ErrorResult(ResponseCode.SAVE_FAILED, "An error occurred while saving the Inventory Assignment");
                }
            } catch (Exception ex) {
                return ErrorResult(ResponseCode.SAVE_FAILED, "An error occurred while saving the Inventory Assignment", ex);
            }
        }

        // DELETE: api/Inventory/assignment/{id}
        [HttpDelete("assignment/{id}"), ActionName("deleteInventoryAssignment")]
        public JsonResult DeleteAssignment(long id) {
            try {
                var result = _inventoryRepository.DeleteAssignInventory(id, GetUser());

                if (result) {
                    return SuccessResult(ResponseCode.DELETED, $"Inventory Assignment removed");
                } else {
                    return ErrorResult(ResponseCode.DELETE_FAILED, "An error occurred while deleting the Inventory assignment");
                }
            } catch (Exception ex) {
                return ErrorResult(ResponseCode.DELETE_FAILED, "An error occurred while deleting the Inventory assignment", ex);
            }
        }
    }
}
