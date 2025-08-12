package com.opex.repository;

import com.opex.model.WorkflowTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkflowTransactionRepository extends JpaRepository<WorkflowTransaction, Long> {
    
    List<WorkflowTransaction> findByWorkflowIdOrderByActionDateDesc(String workflowId);
    
    List<WorkflowTransaction> findByActionByOrderByActionDateDesc(String actionBy);
    
    List<WorkflowTransaction> findByStatusOrderByActionDateDesc(String status);
    
    @Query("SELECT wt FROM WorkflowTransaction wt WHERE wt.workflowId = :workflowId AND wt.stageNumber = :stageNumber")
    List<WorkflowTransaction> findByWorkflowIdAndStageNumber(@Param("workflowId") String workflowId, @Param("stageNumber") Integer stageNumber);
    
    @Query("SELECT wt FROM WorkflowTransaction wt WHERE wt.pendingWith = :pendingWith AND wt.status = 'PENDING' ORDER BY wt.createdAt ASC")
    List<WorkflowTransaction> findPendingTransactionsByUser(@Param("pendingWith") String pendingWith);
    
    @Query("SELECT wt FROM WorkflowTransaction wt WHERE wt.workflowId = :workflowId ORDER BY wt.stageNumber ASC, wt.actionDate DESC")
    List<WorkflowTransaction> findWorkflowHistory(@Param("workflowId") String workflowId);
}